import { prisma } from '../../../../lib/prisma'
import { getCurrentUser } from '../../../../lib/auth'

// Generar número de documento secuencial
async function generateDocumentNumber(documentType) {
  const prefix = documentType === 'factura' ? 'F' : 'B'
  const year = new Date().getFullYear()
  
  // Buscar el último número de documento del año
  const lastQuote = await prisma.quote.findFirst({
    where: {
      documentType: documentType,
      documentNumber: {
        startsWith: `${prefix}-${year}-`
      }
    },
    orderBy: {
      documentNumber: 'desc'
    }
  })

  let nextNumber = 1
  if (lastQuote?.documentNumber) {
    const lastNumber = parseInt(lastQuote.documentNumber.split('-')[2])
    nextNumber = lastNumber + 1
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(6, '0')}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    // Solo admin y superadmin pueden autorizar despachos
    const allowedRoles = ['admin', 'superadmin']
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Solo administradores pueden autorizar despachos' })
    }

    const { id } = req.query
    const { documentType } = req.body

    if (!documentType || !['boleta', 'factura'].includes(documentType)) {
      return res.status(400).json({ error: 'Tipo de documento inválido. Debe ser "boleta" o "factura"' })
    }

    // Obtener la cotización
    const quote = await prisma.quote.findUnique({
      where: { id },
    })

    if (!quote) {
      return res.status(404).json({ error: 'Cotización no encontrada' })
    }

    if (quote.status !== 'approved') {
      return res.status(400).json({ error: 'Solo se pueden autorizar cotizaciones aprobadas' })
    }

    // Parsear productos
    let products
    try {
      const productsData = typeof quote.products === 'string' 
        ? JSON.parse(quote.products) 
        : quote.products
      products = productsData.items || productsData
    } catch (e) {
      return res.status(400).json({ error: 'Error al parsear productos de la cotización' })
    }

    // Verificar stock y descontar
    const stockUpdates = []
    for (const product of products) {
      const productId = product.id
      const quantity = product.quantity || 1

      const dbProduct = await prisma.product.findUnique({
        where: { id: productId },
      })

      if (!dbProduct) {
        return res.status(400).json({ 
          error: `Producto ${product.name || productId} no encontrado` 
        })
      }

      if (dbProduct.stock < quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${product.name || dbProduct.name}. Disponible: ${dbProduct.stock}, Solicitado: ${quantity}` 
        })
      }

      stockUpdates.push({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      })
    }

    // Generar número de documento
    const documentNumber = await generateDocumentNumber(documentType)

    // Actualizar cotización y descontar stock en una transacción
    const [updatedQuote] = await prisma.$transaction([
      // Actualizar cotización
      prisma.quote.update({
        where: { id },
        data: {
          status: 'authorized',
          authorizedBy: user.id,
          authorizedAt: new Date(),
          documentType: documentType,
          documentNumber: documentNumber,
          updatedAt: new Date(),
        },
      }),
      // Descontar stock de todos los productos
      ...stockUpdates.map(update => 
        prisma.product.update(update)
      ),
    ])

    return res.status(200).json({
      ...updatedQuote,
      message: `Despacho autorizado. ${documentType === 'factura' ? 'Factura' : 'Boleta'} generada: ${documentNumber}`,
    })
  } catch (error) {
    console.error('Error authorizing dispatch:', error)
    return res.status(500).json({ error: 'Error al autorizar despacho' })
  }
}
