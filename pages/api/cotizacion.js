import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, whatsapp, products, total, documentType, ruc, businessName, address, notFoundProducts } = req.body

  if (!name || !email || !whatsapp || !products || products.length === 0) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' })
  }

  // Validación adicional para factura
  if (documentType === 'factura') {
    if (!ruc || !businessName || !address) {
      return res.status(400).json({ error: 'Para factura es necesario RUC, Razón Social y Dirección' })
    }
    if (!/^\d{11}$/.test(ruc.replace(/\D/g, ''))) {
      return res.status(400).json({ error: 'El RUC debe tener 11 dígitos' })
    }
  }

  try {
    // Obtener el siguiente número de cotización
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { quoteNumber: 'desc' },
      where: { quoteNumber: { not: null } },
    })
    
    const nextQuoteNumber = lastQuote ? (lastQuote.quoteNumber || 0) + 1 : 1

    // Guardar en la base de datos (incluir documentType, datos fiscales y productos no encontrados en el JSON de products como metadata)
    const productsWithMetadata = {
      items: products,
      documentType: documentType || 'boleta',
      fiscalData: documentType === 'factura' ? {
        ruc: ruc.replace(/\D/g, ''),
        businessName,
        address,
      } : null,
      notFoundProducts: notFoundProducts && notFoundProducts.length > 0 
        ? notFoundProducts.filter(p => p.name && p.name.trim() !== '')
        : null,
    }
    
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: nextQuoteNumber,
        name,
        email,
        whatsapp,
        products: JSON.stringify(productsWithMetadata),
        total: parseFloat(total),
        status: 'pending',
      },
    })

    // Enviar a N8N webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quoteId: quote.id,
            name,
            email,
            whatsapp,
            products,
            total,
            documentType: documentType || 'boleta',
            ruc: documentType === 'factura' ? ruc : null,
            businessName: documentType === 'factura' ? businessName : null,
            address: documentType === 'factura' ? address : null,
            notFoundProducts: notFoundProducts && notFoundProducts.length > 0 
              ? notFoundProducts.filter(p => p.name && p.name.trim() !== '')
              : null,
            createdAt: quote.createdAt,
          }),
        })
      } catch (webhookError) {
        console.error('Error sending to N8N:', webhookError)
        // No fallar la petición si el webhook falla
      }
    }

    return res.status(201).json({
      message: 'Cotización enviada exitosamente',
      quoteId: quote.id,
    })
  } catch (error) {
    console.error('Error creating quote:', error)
    return res.status(500).json({ error: 'Error al crear cotización' })
  }
}

