const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('\n📊 DATOS DE LA BASE DE DATOS\n')
  console.log('='.repeat(50))

  // Usuarios
  const users = await prisma.user.findMany()
  console.log(`\n👥 USUARIOS (${users.length}):`)
  console.log('-'.repeat(50))
  users.forEach((user) => {
    const permissions = user.permissions ? JSON.parse(user.permissions) : []
    console.log(`  • ${user.name}`)
    console.log(`    Email: ${user.email}`)
    console.log(`    Rol: ${user.role}`)
    console.log(`    Permisos: ${permissions.join(', ') || 'Ninguno'}`)
    console.log(`    Creado: ${new Date(user.createdAt).toLocaleString('es-MX')}`)
    console.log('')
  })

  // Productos
  const products = await prisma.product.findMany()
  console.log(`\n📦 PRODUCTOS (${products.length}):`)
  console.log('-'.repeat(50))
  products.forEach((product) => {
    console.log(`  • ${product.name}`)
    console.log(`    Precio: $${product.price.toFixed(2)}`)
    console.log(`    Stock: ${product.stock || 0}`)
    console.log(`    Creado: ${new Date(product.createdAt).toLocaleString('es-MX')}`)
    console.log('')
  })

  // Cotizaciones
  const quotes = await prisma.quote.findMany()
  console.log(`\n📋 COTIZACIONES (${quotes.length}):`)
  console.log('-'.repeat(50))
  quotes.forEach((quote) => {
    console.log(`  • ${quote.name}`)
    console.log(`    Email: ${quote.email}`)
    console.log(`    WhatsApp: ${quote.whatsapp}`)
    console.log(`    Total: $${quote.total.toFixed(2)}`)
    console.log(`    Estado: ${quote.status}`)
    console.log(`    Creado: ${new Date(quote.createdAt).toLocaleString('es-MX')}`)
    console.log('')
  })

  // Estadísticas
  console.log('\n📈 ESTADÍSTICAS:')
  console.log('-'.repeat(50))
  console.log(`  Total Usuarios: ${users.length}`)
  console.log(`  Total Productos: ${products.length}`)
  console.log(`  Total Cotizaciones: ${quotes.length}`)
  
  const totalRevenue = quotes.reduce((sum, q) => sum + q.total, 0)
  console.log(`  Ingresos Totales: $${totalRevenue.toFixed(2)}`)
  
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  console.log(`  Stock Total: ${totalStock} unidades`)
  
  console.log('\n' + '='.repeat(50) + '\n')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

