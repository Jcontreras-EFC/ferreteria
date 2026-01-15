require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Sistema de categorización inteligente basado en palabras clave
function categorizarProducto(nombre) {
  const nombreLower = nombre.toLowerCase()
  
  // Herramientas manuales
  if (
    nombreLower.includes('martillo') ||
    nombreLower.includes('destornillador') ||
    nombreLower.includes('llave') ||
    nombreLower.includes('alicate') ||
    nombreLower.includes('tenaza') ||
    nombreLower.includes('cincel') ||
    nombreLower.includes('formón') ||
    nombreLower.includes('nivel') ||
    nombreLower.includes('cinta métrica') ||
    nombreLower.includes('escalera') ||
    nombreLower.includes('serrucho') ||
    nombreLower.includes('sierra') ||
    nombreLower.includes('taladro manual') ||
    nombreLower.includes('punzón')
  ) {
    return 'Herramientas Manuales'
  }
  
  // Herramientas eléctricas
  if (
    nombreLower.includes('taladro') ||
    nombreLower.includes('atornillador') ||
    nombreLower.includes('pulidora') ||
    nombreLower.includes('amoladora') ||
    nombreLower.includes('esmeril') ||
    nombreLower.includes('lijadora') ||
    nombreLower.includes('sierra eléctrica') ||
    nombreLower.includes('caladora') ||
    nombreLower.includes('rotomartillo') ||
    nombreLower.includes('demoledor') ||
    nombreLower.includes('multitool') ||
    nombreLower.includes('dremel')
  ) {
    return 'Herramientas Eléctricas'
  }
  
  // Materiales de construcción
  if (
    nombreLower.includes('cemento') ||
    nombreLower.includes('arena') ||
    nombreLower.includes('ladrillo') ||
    nombreLower.includes('bloque') ||
    nombreLower.includes('yeso') ||
    nombreLower.includes('cal') ||
    nombreLower.includes('mortero') ||
    nombreLower.includes('pegamento') ||
    nombreLower.includes('adhesivo') ||
    nombreLower.includes('silicona') ||
    nombreLower.includes('masilla') ||
    nombreLower.includes('endurecedor')
  ) {
    return 'Materiales de Construcción'
  }
  
  // Pinturas y acabados
  if (
    nombreLower.includes('pintura') ||
    nombreLower.includes('látex') ||
    nombreLower.includes('esmalte') ||
    nombreLower.includes('barniz') ||
    nombreLower.includes('sellador') ||
    nombreLower.includes('impermeabilizante') ||
    nombreLower.includes('primer') ||
    nombreLower.includes('base') ||
    nombreLower.includes('colorante') ||
    nombreLower.includes('diluyente') ||
    nombreLower.includes('thinner') ||
    nombreLower.includes('rodillo') ||
    nombreLower.includes('brocha') ||
    nombreLower.includes('pincel')
  ) {
    return 'Pinturas y Acabados'
  }
  
  // Tornillería y fijaciones
  if (
    nombreLower.includes('tornillo') ||
    nombreLower.includes('clavo') ||
    nombreLower.includes('taco') ||
    nombreLower.includes('ancla') ||
    nombreLower.includes('perno') ||
    nombreLower.includes('tuerca') ||
    nombreLower.includes('arandela') ||
    nombreLower.includes('remache') ||
    nombreLower.includes('grapa') ||
    nombreLower.includes('alambre') ||
    nombreLower.includes('alambre de púas') ||
    nombreLower.includes('malla')
  ) {
    return 'Tornillería y Fijaciones'
  }
  
  // Tuberías y plomería
  if (
    nombreLower.includes('tubo') ||
    nombreLower.includes('caño') ||
    nombreLower.includes('válvula') ||
    nombreLower.includes('llave') ||
    nombreLower.includes('grifo') ||
    nombreLower.includes('ducha') ||
    nombreLower.includes('lavabo') ||
    nombreLower.includes('inodoro') ||
    nombreLower.includes('sifón') ||
    nombreLower.includes('codo') ||
    nombreLower.includes('tee') ||
    nombreLower.includes('reducción') ||
    nombreLower.includes('pegamento pvc') ||
    nombreLower.includes('cinta teflón')
  ) {
    return 'Tuberías y Plomería'
  }
  
  // Electricidad
  if (
    nombreLower.includes('cable') ||
    nombreLower.includes('alambre') ||
    nombreLower.includes('interruptor') ||
    nombreLower.includes('enchufe') ||
    nombreLower.includes('tomacorriente') ||
    nombreLower.includes('foco') ||
    nombreLower.includes('bombilla') ||
    nombreLower.includes('lámpara') ||
    nombreLower.includes('portalámpara') ||
    nombreLower.includes('caja') ||
    nombreLower.includes('breaker') ||
    nombreLower.includes('fusible') ||
    nombreLower.includes('cinta aislante') ||
    nombreLower.includes('conector')
  ) {
    return 'Electricidad'
  }
  
  // Seguridad y protección
  if (
    nombreLower.includes('casco') ||
    nombreLower.includes('guante') ||
    nombreLower.includes('lente') ||
    nombreLower.includes('gafas') ||
    nombreLower.includes('mascarilla') ||
    nombreLower.includes('tapón') ||
    nombreLower.includes('arnés') ||
    nombreLower.includes('chaleco') ||
    nombreLower.includes('señal') ||
    nombreLower.includes('conos') ||
    nombreLower.includes('cinta')
  ) {
    return 'Seguridad y Protección'
  }
  
  // Jardinería y exteriores
  if (
    nombreLower.includes('manguera') ||
    nombreLower.includes('regadera') ||
    nombreLower.includes('pala') ||
    nombreLower.includes('rastrillo') ||
    nombreLower.includes('azada') ||
    nombreLower.includes('podadora') ||
    nombreLower.includes('cortadora') ||
    nombreLower.includes('semilla') ||
    nombreLower.includes('tierra') ||
    nombreLower.includes('abono') ||
    nombreLower.includes('maceta')
  ) {
    return 'Jardinería y Exteriores'
  }
  
  // Limpieza y mantenimiento
  if (
    nombreLower.includes('escoba') ||
    nombreLower.includes('trapeador') ||
    nombreLower.includes('cepillo') ||
    nombreLower.includes('balde') ||
    nombreLower.includes('cubo') ||
    nombreLower.includes('detergente') ||
    nombreLower.includes('jabón') ||
    nombreLower.includes('desinfectante') ||
    nombreLower.includes('trapo') ||
    nombreLower.includes('esponja')
  ) {
    return 'Limpieza y Mantenimiento'
  }
  
  // Cerrajería y seguridad
  if (
    nombreLower.includes('candado') ||
    nombreLower.includes('cerradura') ||
    nombreLower.includes('llave') ||
    nombreLower.includes('bisagra') ||
    nombreLower.includes('pestillo') ||
    nombreLower.includes('picaporte') ||
    nombreLower.includes('manija') ||
    nombreLower.includes('perilla')
  ) {
    return 'Cerrajería y Seguridad'
  }
  
  // Si no coincide con ninguna categoría, usar "General"
  return 'General'
}

async function categorizarTodos() {
  try {
    console.log('🔍 Buscando todos los productos...\n')
    
    // Obtener todos los productos
    const productos = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    })
    
    console.log(`✅ Encontrados ${productos.length} productos\n`)
    console.log('📝 Categorizando productos...\n`)
    
    let actualizados = 0
    let sinCambios = 0
    let errores = 0
    
    for (const producto of productos) {
      try {
        const categoria = categorizarProducto(producto.name)
        
        // Solo actualizar si la categoría es diferente o si no tiene categoría
        if (producto.category !== categoria) {
          await prisma.product.update({
            where: { id: producto.id },
            data: { category: categoria },
          })
          console.log(`✅ ${producto.name}`)
          console.log(`   Categoría: ${categoria}\n`)
          actualizados++
        } else {
          console.log(`⏭️  ${producto.name} (ya tiene categoría: ${producto.category || 'sin categoría'})\n`)
          sinCambios++
        }
      } catch (error) {
        console.error(`❌ Error al categorizar "${producto.name}":`, error.message)
        errores++
      }
    }
    
    console.log('\n✨ RESUMEN:')
    console.log(`   ✅ Actualizados: ${actualizados}`)
    console.log(`   ⏭️  Sin cambios: ${sinCambios}`)
    console.log(`   ❌ Errores: ${errores}`)
    console.log(`   📦 Total: ${productos.length}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

categorizarTodos()
