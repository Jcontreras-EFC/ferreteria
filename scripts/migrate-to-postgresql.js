const { PrismaClient } = require('@prisma/client')
const Database = require('better-sqlite3')
const path = require('path')

// Cliente para PostgreSQL (Supabase)
const prisma = new PrismaClient()

// Conexión a SQLite local - Usar la base de datos correcta
const sqlitePath = path.join(__dirname, '..', 'prisma', 'prisma', 'dev.db')
// Si no existe, intentar con la otra ubicación
const altPath = path.join(__dirname, '..', 'prisma', 'dev.db')
const dbPath = require('fs').existsSync(sqlitePath) ? sqlitePath : altPath
const db = new Database(dbPath)
console.log(`📂 Usando base de datos: ${dbPath}`)

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos de SQLite a PostgreSQL...\n')

    // 1. Migrar Users
    console.log('📦 Migrando usuarios...')
    const users = db.prepare('SELECT * FROM User').all()
    console.log(`   Encontrados ${users.length} usuarios`)
    
    for (const user of users) {
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            phone: user.phone || null,
            role: user.role || 'admin',
            permissions: user.permissions || '[]',
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          },
        })
        console.log(`   ✓ Usuario migrado: ${user.email}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠ Usuario ya existe: ${user.email} (saltando)`)
        } else {
          throw error
        }
      }
    }

    // 2. Migrar Products
    console.log('\n📦 Migrando productos...')
    const products = db.prepare('SELECT * FROM Product').all()
    console.log(`   Encontrados ${products.length} productos`)
    
    for (const product of products) {
      try {
        await prisma.product.create({
          data: {
            id: product.id,
            name: product.name,
            description: product.description || null,
            price: product.price,
            image: product.image || null,
            stock: product.stock || 0,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),
          },
        })
        console.log(`   ✓ Producto migrado: ${product.name}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠ Producto ya existe: ${product.name} (saltando)`)
        } else {
          throw error
        }
      }
    }

    // 3. Migrar Quotes
    console.log('\n📦 Migrando cotizaciones...')
    const quotes = db.prepare('SELECT * FROM Quote').all()
    console.log(`   Encontradas ${quotes.length} cotizaciones`)
    
    for (const quote of quotes) {
      try {
        await prisma.quote.create({
          data: {
            id: quote.id,
            quoteNumber: quote.quoteNumber || null,
            name: quote.name,
            email: quote.email,
            whatsapp: quote.whatsapp,
            products: quote.products,
            total: quote.total,
            status: quote.status || 'pending',
            createdAt: new Date(quote.createdAt),
            updatedAt: new Date(quote.updatedAt),
          },
        })
        console.log(`   ✓ Cotización migrada: ${quote.id}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠ Cotización ya existe: ${quote.id} (saltando)`)
        } else {
          throw error
        }
      }
    }

    console.log('\n✅ ¡Migración completada exitosamente!')
    console.log(`   - ${users.length} usuarios`)
    console.log(`   - ${products.length} productos`)
    console.log(`   - ${quotes.length} cotizaciones`)

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message)
    throw error
  } finally {
    db.close()
    await prisma.$disconnect()
  }
}

migrateData()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
