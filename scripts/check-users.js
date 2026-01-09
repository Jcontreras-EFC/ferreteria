const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log('\n📋 Usuarios en la base de datos:\n')
  if (users.length === 0) {
    console.log('❌ No hay usuarios en la base de datos')
    console.log('   Ejecuta: node scripts/create-admin.js\n')
  } else {
    users.forEach((user) => {
      console.log(`✅ ${user.email}`)
      console.log(`   Nombre: ${user.name}`)
      console.log(`   Rol: ${user.role}`)
      console.log('')
    })
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

