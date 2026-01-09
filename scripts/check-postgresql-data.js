const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkData() {
  try {
    console.log('📊 Verificando datos en PostgreSQL (Supabase):\n')

    // Usuarios
    const users = await prisma.user.findMany()
    console.log(`👥 Usuarios: ${users.length}`)
    users.forEach(u => {
      console.log(`   - ${u.email} (${u.name})`)
      console.log(`     Rol: ${u.role}`)
      console.log(`     Permisos: ${u.permissions}`)
    })

    // Productos
    const products = await prisma.product.findMany()
    console.log(`\n📦 Productos: ${products.length}`)
    products.forEach(p => {
      console.log(`   - ${p.name} - S/.${p.price}`)
    })

    // Cotizaciones
    const quotes = await prisma.quote.findMany()
    console.log(`\n📄 Cotizaciones: ${quotes.length}`)
    if (quotes.length > 0) {
      quotes.forEach(q => {
        console.log(`   - ${q.name} (${q.email}) - Total: S/.${q.total} - Estado: ${q.status}`)
      })
    }

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()
