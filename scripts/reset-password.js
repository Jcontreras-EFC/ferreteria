const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const newPassword = process.argv[3] || 'nuevaPassword123'

  if (!email) {
    console.log('❌ Uso: node scripts/reset-password.js <email> [nueva-contraseña]')
    console.log('   Ejemplo: node scripts/reset-password.js jcontreras@efc.com.pe miNuevaPass123')
    process.exit(1)
  }

  try {
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log(`❌ Usuario con email "${email}" no encontrado`)
      process.exit(1)
    }

    console.log(`\n📋 Usuario encontrado:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.name}`)
    console.log(`   Rol: ${user.role}`)
    console.log(`\n🔄 Reseteando contraseña...`)

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    console.log(`\n✅ Contraseña reseteada exitosamente`)
    console.log(`   Email: ${email}`)
    console.log(`   Nueva contraseña: ${newPassword}`)
    console.log(`\n⚠️  IMPORTANTE: Cambia esta contraseña después de iniciar sesión`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()












