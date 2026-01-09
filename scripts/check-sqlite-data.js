const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '..', 'prisma', 'dev.db'))

console.log('📊 Verificando datos en SQLite:\n')

// Usuarios
const users = db.prepare('SELECT * FROM User').all()
console.log(`👥 Usuarios: ${users.length}`)
users.forEach(u => {
  console.log(`   - ${u.email} (${u.name})`)
  console.log(`     Rol: ${u.role}`)
  console.log(`     Permisos: ${u.permissions}`)
})

// Productos
const products = db.prepare('SELECT * FROM Product').all()
console.log(`\n📦 Productos: ${products.length}`)
products.forEach(p => {
  console.log(`   - ${p.name} - S/.${p.price}`)
})

// Cotizaciones
const quotes = db.prepare('SELECT * FROM Quote').all()
console.log(`\n📄 Cotizaciones: ${quotes.length}`)
if (quotes.length > 0) {
  quotes.forEach(q => {
    console.log(`   - ${q.name} (${q.email}) - Total: S/.${q.total} - Estado: ${q.status}`)
  })
}

db.close()
