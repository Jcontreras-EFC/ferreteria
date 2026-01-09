import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    // Estadísticas generales
    const [
      totalProducts,
      totalQuotes,
      totalUsers,
      products,
      quotes,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.quote.count(),
      prisma.user.count(),
      prisma.product.findMany({
        select: { id: true, name: true, price: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.quote.findMany({
        select: { id: true, total: true, createdAt: true, status: true, products: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Calcular productos más cotizados (contar cuántas veces aparece cada producto en cotizaciones)
    const productCounts = {}
    quotes.forEach((quote) => {
      try {
        const quoteProducts = JSON.parse(quote.products)
        if (Array.isArray(quoteProducts)) {
          quoteProducts.forEach((product) => {
            if (product.id) {
              // Contar cuántas veces aparece el producto en cotizaciones (no la cantidad)
              productCounts[product.id] = (productCounts[product.id] || 0) + 1
            }
          })
        }
      } catch (e) {
        console.error('Error parsing quote products:', e)
        // Ignorar errores de parsing
      }
    })

    // Obtener todos los productos para poder mapear los IDs
    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true },
    })

    const topProducts = Object.entries(productCounts)
      .map(([productId, count]) => {
        const product = allProducts.find((p) => p.id === productId)
        return product ? { name: product.name, quoteCount: count } : null
      })
      .filter(Boolean)
      .sort((a, b) => b.quoteCount - a.quoteCount)
      .slice(0, 5)

    // Estadísticas de cotizaciones por mes (últimos 6 meses)
    const monthlyQuotes = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyQuotes[monthKey] = 0
    }

    quotes.forEach((quote) => {
      const date = new Date(quote.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (monthlyQuotes[monthKey] !== undefined) {
        monthlyQuotes[monthKey]++
      }
    })

    const monthlyData = Object.entries(monthlyQuotes).map(([month, count]) => ({
      month,
      count,
    }))

    // Total de ingresos (suma de todas las cotizaciones)
    const totalRevenue = quotes.reduce((sum, quote) => sum + quote.total, 0)

    // Cotizaciones por estado
    const quotesByStatus = {
      pending: quotes.filter((q) => q.status === 'pending').length,
      sent: quotes.filter((q) => q.status === 'sent').length,
      completed: quotes.filter((q) => q.status === 'completed').length,
    }

    return res.status(200).json({
      totalProducts,
      totalQuotes,
      totalUsers,
      totalRevenue,
      topProducts,
      monthlyData,
      quotesByStatus,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
}

