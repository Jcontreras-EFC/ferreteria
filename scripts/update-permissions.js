const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'admin@ferreteria.com'
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        permissions: JSON.stringify(['view', 'create', 'edit', 'delete']),
      },
    })

    console.log('✅ Permisos actualizados para:', user.email)
    console.log('   Permisos:', JSON.parse(user.permissions).join(', '))
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()

