import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { search } = req.query
      let where = {}

      if (search) {
        // SQLite no soporta mode: 'insensitive', usamos contains sin mode
        where = {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json(products)
    } catch (error) {
      console.error('Error fetching products:', error)
      return res.status(500).json({ error: 'Error al obtener productos' })
    }
  }

  if (req.method === 'POST') {
    try {
      const user = await getCurrentUser(req)
      if (!user) {
        return res.status(401).json({ error: 'No autorizado' })
      }

      const { name, description, price, image, stock } = req.body

      if (!name || !price) {
        return res.status(400).json({ error: 'Nombre y precio son requeridos' })
      }

      const product = await prisma.product.create({
        data: {
          name,
          description: description || null,
          price: parseFloat(price),
          image: image || null,
          stock: parseInt(stock) || 0,
        },
      })

      return res.status(201).json(product)
    } catch (error) {
      console.error('Error creating product:', error)
      return res.status(500).json({ error: 'Error al crear producto' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

