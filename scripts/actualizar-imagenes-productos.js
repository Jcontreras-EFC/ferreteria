// Script simple para actualizar imágenes de productos automáticamente
// Ejecuta: npm run actualizar-imagenes

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })
require('dotenv').config() // También cargar .env si existe

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Mapeo de palabras clave a URLs de imágenes de Unsplash
const imagenesPorProducto = {
  'alicat': 'https://images.unsplash.com/photo-1622819584099-e04ccb14e8a7?w=800&h=600&fit=crop&q=80',
  'pinza': 'https://images.unsplash.com/photo-1622819584099-e04ccb14e8a7?w=800&h=600&fit=crop&q=80',
  'cinta': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80',
  'métrica': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80',
  'metro': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80',
  'destornillador': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80',
  'phillips': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80',
  'llave': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  'inglesa': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  'martillo': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80',
  'nivel': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80',
  'burbuja': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80',
  'pintura': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop&q=80',
  'latex': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop&q=80',
  'sierra': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80',
  'taladro': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80',
  'drill': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80',
  'tornillo': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  'screw': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
}

function obtenerImagenPorNombre(nombre) {
  const nombreLower = nombre.toLowerCase()
  
  // Buscar palabra clave en el nombre
  for (const [palabra, url] of Object.entries(imagenesPorProducto)) {
    if (nombreLower.includes(palabra)) {
      return url
    }
  }
  
  // Si no encuentra, devolver imagen genérica de herramientas
  return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80'
}

async function actualizarImagenes() {
  try {
    console.log('🔍 Buscando productos...\n')
    
    // Obtener todos los productos
    const productos = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        image: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    console.log(`✅ Encontrados ${productos.length} productos\n`)
    console.log('📝 Actualizando imágenes...\n')

    let actualizados = 0
    let sinCambios = 0

    for (const producto of productos) {
      const nuevaImagen = obtenerImagenPorNombre(producto.name)
      
      // Solo actualizar si la imagen es diferente
      if (producto.image !== nuevaImagen) {
        await prisma.product.update({
          where: { id: producto.id },
          data: { image: nuevaImagen },
        })
        console.log(`✅ ${producto.name}`)
        console.log(`   Nueva imagen: ${nuevaImagen}\n`)
        actualizados++
      } else {
        console.log(`⏭️  ${producto.name} (ya tiene imagen correcta)\n`)
        sinCambios++
      }
    }

    console.log('\n✨ RESUMEN:')
    console.log(`   ✅ Actualizados: ${actualizados}`)
    console.log(`   ⏭️  Sin cambios: ${sinCambios}`)
    console.log(`   📦 Total: ${productos.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

actualizarImagenes()
