const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const productosEjemplo = [
  {
    name: 'Martillo de Acero 500g',
    description: 'Martillo profesional con mango de fibra de vidrio y cabeza de acero forjado. Ideal para trabajos de construcción.',
    price: 25.99,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
  },
  {
    name: 'Destornillador Phillips #2',
    description: 'Destornillador Phillips de 6 pulgadas con mango ergonómico y punta magnética.',
    price: 8.50,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1622819584099-e04ccb14e8a7?w=400',
  },
  {
    name: 'Taladro Inalámbrico 18V',
    description: 'Taladro percutor inalámbrico con batería de litio, incluye cargador y maletín.',
    price: 89.99,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
  },
  {
    name: 'Llave Inglesa Ajustable 10"',
    description: 'Llave ajustable de acero cromado, capacidad hasta 1 pulgada.',
    price: 15.75,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    name: 'Cinta Métrica 5m',
    description: 'Cinta métrica retráctil de 5 metros con caja de plástico resistente.',
    price: 6.99,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
  },
  {
    name: 'Nivel de Burbuja 60cm',
    description: 'Nivel de burbuja profesional de aluminio con 3 viales de precisión.',
    price: 18.50,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
  },
  {
    name: 'Alicates de Punta',
    description: 'Alicates de punta larga de 6 pulgadas, ideales para trabajos eléctricos.',
    price: 12.99,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1622819584099-e04ccb14e8a7?w=400',
  },
  {
    name: 'Sierra de Mano 20"',
    description: 'Sierra de mano con hoja de acero templado y mango ergonómico.',
    price: 22.00,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
  },
  {
    name: 'Tornillos Autorroscantes #8 x 1"',
    description: 'Caja de 100 tornillos autorroscantes de acero inoxidable.',
    price: 4.99,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    name: 'Pintura Latex Blanca 4L',
    description: 'Pintura látex de alta calidad, cubre 12m² por litro, acabado mate.',
    price: 35.99,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
  },
]

async function main() {
  console.log('🌱 Agregando productos de ejemplo...\n')

  for (const producto of productosEjemplo) {
    try {
      const product = await prisma.product.create({
        data: producto,
      })
      console.log(`✅ ${product.name} - $${product.price}`)
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  ${producto.name} ya existe, omitiendo...`)
      } else {
        console.error(`❌ Error al crear ${producto.name}:`, error.message)
      }
    }
  }

  console.log('\n✨ Productos agregados exitosamente!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

