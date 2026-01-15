// Cargar variables de entorno (igual que otros scripts)
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

// Verificar que DATABASE_URL esté configurada
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurada')
  console.error('   Verifica que exista un archivo .env o .env.local con DATABASE_URL')
  process.exit(1)
}

// Verificar formato de DATABASE_URL
if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ ERROR: DATABASE_URL debe empezar con postgresql:// o postgres://')
  console.error(`   Valor actual comienza con: ${process.env.DATABASE_URL.substring(0, 30)}...`)
  process.exit(1)
}

const prisma = new PrismaClient()

// Sistema de categorización inteligente
function categorizarProducto(nombre) {
  const nombreLower = nombre.toLowerCase()
  
  if (nombreLower.includes('martillo') || nombreLower.includes('destornillador') || nombreLower.includes('llave') || nombreLower.includes('alicate') || nombreLower.includes('tenaza') || nombreLower.includes('cincel') || nombreLower.includes('formón') || nombreLower.includes('nivel') || nombreLower.includes('cinta métrica') || nombreLower.includes('escalera') || nombreLower.includes('serrucho') || nombreLower.includes('sierra') || nombreLower.includes('punzón')) {
    return 'Herramientas Manuales'
  }
  
  if (nombreLower.includes('taladro') || nombreLower.includes('atornillador') || nombreLower.includes('pulidora') || nombreLower.includes('amoladora') || nombreLower.includes('esmeril') || nombreLower.includes('lijadora') || nombreLower.includes('sierra eléctrica') || nombreLower.includes('caladora') || nombreLower.includes('rotomartillo') || nombreLower.includes('demoledor')) {
    return 'Herramientas Eléctricas'
  }
  
  if (nombreLower.includes('cemento') || nombreLower.includes('arena') || nombreLower.includes('ladrillo') || nombreLower.includes('bloque') || nombreLower.includes('yeso') || nombreLower.includes('cal') || nombreLower.includes('mortero') || nombreLower.includes('pegamento') || nombreLower.includes('adhesivo') || nombreLower.includes('silicona') || nombreLower.includes('masilla')) {
    return 'Materiales de Construcción'
  }
  
  if (nombreLower.includes('pintura') || nombreLower.includes('látex') || nombreLower.includes('esmalte') || nombreLower.includes('barniz') || nombreLower.includes('sellador') || nombreLower.includes('impermeabilizante') || nombreLower.includes('primer') || nombreLower.includes('rodillo') || nombreLower.includes('brocha') || nombreLower.includes('pincel')) {
    return 'Pinturas y Acabados'
  }
  
  if (nombreLower.includes('tornillo') || nombreLower.includes('clavo') || nombreLower.includes('taco') || nombreLower.includes('ancla') || nombreLower.includes('perno') || nombreLower.includes('tuerca') || nombreLower.includes('arandela') || nombreLower.includes('remache') || nombreLower.includes('grapa') || nombreLower.includes('alambre')) {
    return 'Tornillería y Fijaciones'
  }
  
  if (nombreLower.includes('tubo') || nombreLower.includes('caño') || nombreLower.includes('válvula') || nombreLower.includes('grifo') || nombreLower.includes('ducha') || nombreLower.includes('lavabo') || nombreLower.includes('inodoro') || nombreLower.includes('sifón') || nombreLower.includes('codo') || nombreLower.includes('tee')) {
    return 'Tuberías y Plomería'
  }
  
  if (nombreLower.includes('cable') || nombreLower.includes('interruptor') || nombreLower.includes('enchufe') || nombreLower.includes('tomacorriente') || nombreLower.includes('foco') || nombreLower.includes('bombilla') || nombreLower.includes('lámpara') || nombreLower.includes('breaker') || nombreLower.includes('fusible')) {
    return 'Electricidad'
  }
  
  if (nombreLower.includes('casco') || nombreLower.includes('guante') || nombreLower.includes('lente') || nombreLower.includes('gafas') || nombreLower.includes('mascarilla') || nombreLower.includes('tapón') || nombreLower.includes('arnés')) {
    return 'Seguridad y Protección'
  }
  
  if (nombreLower.includes('manguera') || nombreLower.includes('regadera') || nombreLower.includes('pala') || nombreLower.includes('rastrillo') || nombreLower.includes('azada') || nombreLower.includes('podadora') || nombreLower.includes('cortadora')) {
    return 'Jardinería y Exteriores'
  }
  
  if (nombreLower.includes('escoba') || nombreLower.includes('trapeador') || nombreLower.includes('cepillo') || nombreLower.includes('balde') || nombreLower.includes('cubo') || nombreLower.includes('detergente')) {
    return 'Limpieza y Mantenimiento'
  }
  
  if (nombreLower.includes('candado') || nombreLower.includes('cerradura') || nombreLower.includes('bisagra') || nombreLower.includes('pestillo') || nombreLower.includes('picaporte')) {
    return 'Cerrajería y Seguridad'
  }
  
  return 'General'
}

async function main() {
  try {
    console.log('\n🚀 INICIANDO CATEGORIZACIÓN AUTOMÁTICA\n')
    console.log('═══════════════════════════════════════════════════════════\n')
    
    const productos = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    })
    
    console.log(`📦 Total de productos encontrados: ${productos.length}\n`)
    console.log('═══════════════════════════════════════════════════════════\n')
    
    if (productos.length === 0) {
      console.log('⚠️  No hay productos en la base de datos.\n')
      return
    }
    
    let actualizados = 0
    let sinCambios = 0
    let errores = 0
    
    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i]
      try {
        const categoria = categorizarProducto(producto.name)
        const tieneCategoria = producto.category && producto.category.trim() !== ''
        
        if (!tieneCategoria || producto.category !== categoria) {
          await prisma.product.update({
            where: { id: producto.id },
            data: { category: categoria },
          })
          console.log(`[${i + 1}/${productos.length}] ✅ ${producto.name}`)
          console.log(`   📌 Categoría asignada: ${categoria}\n`)
          actualizados++
        } else {
          console.log(`[${i + 1}/${productos.length}] ⏭️  ${producto.name} (ya tiene: ${producto.category})\n`)
          sinCambios++
        }
      } catch (error) {
        console.error(`[${i + 1}/${productos.length}] ❌ Error: ${producto.name}`)
        console.error(`   Error: ${error.message}\n`)
        errores++
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('✨ RESUMEN FINAL')
    console.log('═══════════════════════════════════════════════════════════\n')
    console.log(`   ✅ Productos actualizados: ${actualizados}`)
    console.log(`   ⏭️  Sin cambios: ${sinCambios}`)
    console.log(`   ❌ Errores: ${errores}`)
    console.log(`   📦 Total procesados: ${productos.length}\n`)
    console.log('═══════════════════════════════════════════════════════════\n')
    
  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
