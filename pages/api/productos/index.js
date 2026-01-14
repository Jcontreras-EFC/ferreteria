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

      // Obtener todos los productos ordenados por fecha de creación (más antiguos primero)
      const allProducts = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'asc' },
      })

      // Ordenar: productos con imagen primero, pero manteniendo el orden cronológico dentro de cada grupo
      // Los productos nuevos se agregan al final (createdAt más reciente = último)
      const products = allProducts.sort((a, b) => {
        const aHasImage = a.image && a.image.trim() !== ''
        const bHasImage = b.image && b.image.trim() !== ''
        
        // Primero ordenar por imagen (con imagen primero)
        if (aHasImage && !bHasImage) return -1
        if (!aHasImage && bHasImage) return 1
        
        // Si ambos tienen imagen o ambos no tienen, mantener orden cronológico ascendente
        // Los productos más antiguos primero, los nuevos al final
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateA - dateB
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

      // Solo administradores pueden crear productos
      const adminRoles = ['admin', 'superadmin']
      if (!adminRoles.includes(user.role?.toLowerCase())) {
        return res.status(403).json({ error: 'Solo administradores pueden crear productos' })
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

