// Script para subir imágenes de productos a Supabase Storage
// Uso: node scripts/subir-imagen-producto.js "nombre-producto" "ruta/imagen.jpg"
// Ejemplo: node scripts/subir-imagen-producto.js "Pintura Latex Blanca 4L" "C:/Users/.../pintura.jpg"

require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const PRODUCTS_BUCKET = 'products-images'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.error('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function subirImagenProducto(nombreProducto, rutaImagen) {
  try {
    console.log(`\n🔍 Buscando producto: "${nombreProducto}"...`)
    
    // Buscar producto
    const producto = await prisma.product.findFirst({
      where: {
        name: {
          contains: nombreProducto,
          mode: 'insensitive',
        },
      },
    })

    if (!producto) {
      console.error(`❌ No se encontró el producto: "${nombreProducto}"`)
      console.log('\n📋 Productos disponibles:')
      const productos = await prisma.product.findMany({
        select: { name: true },
        orderBy: { name: 'asc' },
      })
      productos.forEach(p => console.log(`   - ${p.name}`))
      return
    }

    console.log(`✅ Producto encontrado: ${producto.name} (ID: ${producto.id})`)

    // Verificar que el archivo existe
    if (!fs.existsSync(rutaImagen)) {
      console.error(`❌ No se encontró el archivo: ${rutaImagen}`)
      return
    }

    console.log(`\n📤 Subiendo imagen: ${rutaImagen}...`)

    // Leer archivo
    const fileBuffer = fs.readFileSync(rutaImagen)
    const extension = path.extname(rutaImagen)
    const fileName = `product-${producto.id}-${Date.now()}${extension}`

    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .upload(fileName, fileBuffer, {
        contentType: `image/${extension.replace('.', '')}`,
        upsert: false,
      })

    if (uploadError) {
      console.error('❌ Error al subir a Supabase:', uploadError)
      return
    }

    console.log('✅ Imagen subida exitosamente')

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(PRODUCTS_BUCKET)
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl
    console.log(`📎 URL pública: ${publicUrl}`)

    // Actualizar producto en la base de datos
    console.log('\n💾 Actualizando producto en la base de datos...')
    await prisma.product.update({
      where: { id: producto.id },
      data: { image: publicUrl },
    })

    console.log(`\n✨ ¡Éxito! Imagen actualizada para "${producto.name}"`)
    console.log(`   URL: ${publicUrl}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('📖 Uso: node scripts/subir-imagen-producto.js "Nombre Producto" "ruta/imagen.jpg"')
  console.log('\nEjemplo:')
  console.log('   node scripts/subir-imagen-producto.js "Pintura Latex Blanca 4L" "C:/Users/.../pintura.jpg"')
  console.log('\nO con ruta relativa:')
  console.log('   node scripts/subir-imagen-producto.js "Pintura Latex Blanca 4L" "./imagenes/pintura.jpg"')
  process.exit(1)
}

const nombreProducto = args[0]
const rutaImagen = args[1]

subirImagenProducto(nombreProducto, rutaImagen)
