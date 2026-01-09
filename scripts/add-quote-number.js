const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Agregando columna quoteNumber a la tabla Quote...')
    
    // Agregar la columna si no existe
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE Quote ADD COLUMN quoteNumber INTEGER
      `)
      console.log('✓ Columna quoteNumber agregada')
    } catch (e) {
      if (e.message.includes('duplicate column name') || e.message.includes('already exists')) {
        console.log('✓ La columna quoteNumber ya existe')
      } else {
        throw e
      }
    }
    
    // Crear índice único si no existe
    try {
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS Quote_quoteNumber_key ON Quote(quoteNumber)
      `)
      console.log('✓ Índice único creado')
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('✓ Índice único ya existe')
      } else {
        throw e
      }
    }
    
    console.log('✅ Migración completada exitosamente')
  } catch (error) {
    console.error('Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('Error ejecutando migración:', e)
    process.exit(1)
  })

