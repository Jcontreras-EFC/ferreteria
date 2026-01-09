// Sube todas las imágenes de una carpeta
// Uso: node scripts/subir-todas-imagenes.js "D:\IMAGENES"

require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey)
const PRODUCTS_BUCKET = 'products-images'

// Mapeo de nombres de archivo a nombres de productos
const mapeo = {
  'alicate de punta': 'Alicates de Punta',
  'alicate de  punta': 'Alicates de Punta', // Con doble espacio
  'burbuja': 'Nivel de Burbuja 60cm',
  'cinta metrica': 'Cinta Métrica 5m',
  'destornillador': 'Destornillador Phillips #2',
  'llave inglesa': 'Llave Inglesa Ajustable 10"',
  'martillo': 'Martillo de Acero 500g',
  'pintura 4l': 'Pintura Latex Blanca 4L',
  'sierra de mano': 'Sierra de Mano 20"',
  'taladro inalambrico': 'Taladro Inalámbrico 18V',
  'tornillos autorroscantes': 'Tornillos Autorroscantes #8 x 1"'
}

const carpetaImagenes = process.argv[2] || './imagenes'

async function subirTodas() {
  const archivos = fs.readdirSync(carpetaImagenes).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  
  console.log(`📦 Encontradas ${archivos.length} imágenes\n`)

  for (const archivo of archivos) {
    const nombreSinExt = path.basename(archivo, path.extname(archivo)).toLowerCase().trim()
    const nombreProducto = mapeo[nombreSinExt]

    if (!nombreProducto) {
      console.log(`⚠️  No mapeado: ${archivo}`)
      continue
    }

    try {
      const fileBuffer = fs.readFileSync(path.join(carpetaImagenes, archivo))
      const fileName = `product-${Date.now()}-${archivo}`

      console.log(`📤 Subiendo: ${archivo} → ${nombreProducto}`)

      const { error } = await supabase.storage.from(PRODUCTS_BUCKET).upload(fileName, fileBuffer, {
        contentType: `image/${path.extname(archivo).slice(1)}`,
        upsert: false
      })

      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
        continue
      }

      const { data: urlData } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(fileName)
      
      // Actualizar usando Supabase REST API
      const { data: productos } = await supabase.from('Product').select('id').eq('name', nombreProducto).limit(1)
      
      if (productos && productos.length > 0) {
        await supabase.from('Product').update({ image: urlData.publicUrl }).eq('id', productos[0].id)
        console.log(`   ✅ ${nombreProducto}`)
      } else {
        console.log(`   ⚠️  Producto no encontrado en BD: ${nombreProducto}`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }

  console.log('\n✨ Completado')
}

subirTodas()
