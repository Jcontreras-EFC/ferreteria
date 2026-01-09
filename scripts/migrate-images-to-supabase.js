/**
 * Script para migrar imágenes locales a Supabase Storage
 * 
 * Uso:
 * 1. Configura las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY
 * 2. Ejecuta: node scripts/migrate-images-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados')
  console.error('   Configúralos en tu archivo .env o como variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const PRODUCTS_BUCKET = 'products-images'

async function ensureBucketExists() {
  console.log('📦 Verificando bucket de Supabase Storage...')
  
  // Intentar verificar si el bucket existe (puede fallar por permisos, pero continuamos)
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.log('⚠️  No se pudo verificar buckets (puede ser por permisos)')
    console.log('   Continuando de todas formas...')
    return true // Continuar aunque falle
  }

  const bucketExists = buckets?.some(b => b.name === PRODUCTS_BUCKET)

  if (bucketExists) {
    console.log('✅ Bucket encontrado')
  } else {
    console.log(`⚠️  El bucket "${PRODUCTS_BUCKET}" no se encontró en la lista`)
    console.log('   Continuando de todas formas (puede que exista pero no tengamos permisos para listarlo)')
  }

  return true
}

async function migrateLocalImages() {
  console.log('\n🖼️  Migrando imágenes locales a Supabase Storage...\n')

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('⚠️  No existe el directorio de uploads local')
    return
  }

  const files = fs.readdirSync(uploadsDir).filter(file => 
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
  )

  if (files.length === 0) {
    console.log('⚠️  No se encontraron imágenes para migrar')
    return
  }

  console.log(`📸 Encontradas ${files.length} imágenes para migrar\n`)

  let successCount = 0
  let errorCount = 0

  for (const file of files) {
    try {
      const filePath = path.join(uploadsDir, file)
      const fileBuffer = fs.readFileSync(filePath)
      const fileStats = fs.statSync(filePath)
      const mimeType = getMimeType(file)

      console.log(`📤 Subiendo: ${file} (${(fileStats.size / 1024).toFixed(2)} KB)`)

      // Subir a Supabase
      const { data, error } = await supabase.storage
        .from(PRODUCTS_BUCKET)
        .upload(file, fileBuffer, {
          contentType: mimeType,
          upsert: true, // Sobrescribir si existe
        })

      if (error) {
        console.error(`   ❌ Error: ${error.message}`)
        errorCount++
        continue
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(PRODUCTS_BUCKET)
        .getPublicUrl(file)

      console.log(`   ✅ Subida: ${urlData.publicUrl}`)
      successCount++
    } catch (error) {
      console.error(`   ❌ Error procesando ${file}:`, error.message)
      errorCount++
    }
  }

  console.log(`\n✨ Migración completada:`)
  console.log(`   ✅ Exitosas: ${successCount}`)
  console.log(`   ❌ Errores: ${errorCount}`)
}

async function updateProductUrls() {
  console.log('\n🔄 Actualizando URLs de productos en la base de datos...\n')

  try {
    const products = await prisma.product.findMany({
      where: {
        image: {
          startsWith: '/uploads/'
        }
      }
    })

    if (products.length === 0) {
      console.log('⚠️  No se encontraron productos con imágenes locales para actualizar')
      return
    }

    console.log(`📦 Encontrados ${products.length} productos con imágenes locales\n`)

    let updatedCount = 0

    for (const product of products) {
      try {
        // Extraer nombre del archivo de la URL local
        const fileName = product.image.replace('/uploads/', '')
        
        // Construir nueva URL de Supabase
        const { data: urlData } = supabase.storage
          .from(PRODUCTS_BUCKET)
          .getPublicUrl(fileName)

        // Actualizar en la base de datos
        await prisma.product.update({
          where: { id: product.id },
          data: { image: urlData.publicUrl }
        })

        console.log(`✅ Actualizado: ${product.name}`)
        console.log(`   Antes: ${product.image}`)
        console.log(`   Ahora: ${urlData.publicUrl}\n`)
        updatedCount++
      } catch (error) {
        console.error(`❌ Error actualizando ${product.name}:`, error.message)
      }
    }

    console.log(`\n✨ Actualización completada: ${updatedCount} productos actualizados`)
  } catch (error) {
    console.error('❌ Error al actualizar productos:', error)
  }
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  }
  return mimeTypes[ext] || 'image/jpeg'
}

async function main() {
  console.log('🚀 Iniciando migración de imágenes a Supabase Storage\n')
  console.log('=' .repeat(50))

  try {
    // 1. Verificar/crear bucket (continuar aunque falle la verificación)
    console.log('📦 Asumiendo que el bucket existe...')
    const bucketReady = await ensureBucketExists()
    if (!bucketReady) {
      console.log('⚠️  No se pudo verificar el bucket, pero continuando...')
      console.log('   Asegúrate de que el bucket "products-images" existe en Supabase\n')
    }

    // 2. Migrar imágenes locales
    await migrateLocalImages()

    // 3. Actualizar URLs en la base de datos
    await updateProductUrls()

    console.log('\n' + '='.repeat(50))
    console.log('✅ ¡Migración completada exitosamente!')
    console.log('\n💡 Nota: Las imágenes locales se mantienen como respaldo.')
    console.log('   Puedes eliminarlas manualmente después de verificar que todo funciona.')
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
