import { prisma } from '../../../../lib/prisma'
import { generateQuotePDF } from '../../../../lib/pdfGenerator'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const { download } = req.query

  try {
    // Buscar la cotización
    const quote = await prisma.quote.findUnique({
      where: { id },
    })

    if (!quote) {
      return res.status(404).json({ error: 'Cotización no encontrada' })
    }

    // Generar el PDF usando la función mejorada
    const pdfBuffer = generateQuotePDF(quote)

    // Configurar headers
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      download === '1'
        ? `attachment; filename="cotizacion-${quote.id.slice(0, 8)}.pdf"`
        : `inline; filename="cotizacion-${quote.id.slice(0, 8)}.pdf"`
    )

    // Enviar el PDF
    res.send(pdfBuffer)
  } catch (error) {
    console.error('Error generating PDF:', error)
    return res.status(500).json({ error: 'Error al generar el PDF' })
  }
}
