import { jsPDF } from 'jspdf'

// Función auxiliar para dibujar ondas decorativas
function drawWavePattern(doc, yPos, pageWidth, isTop = true) {
  const waveHeight = 15
  const waveColor = [0, 102, 204] // Azul principal #0066CC
  const waveColorLight = [51, 153, 255] // Azul claro #3399FF
  
  doc.setFillColor(waveColor[0], waveColor[1], waveColor[2])
  doc.setDrawColor(waveColor[0], waveColor[1], waveColor[2])
  
  // Dibujar ondas simples
  const wavePoints = []
  const segments = 8
  const segmentWidth = pageWidth / segments
  
  for (let i = 0; i <= segments; i++) {
    const x = i * segmentWidth
    const y = yPos + (isTop ? 0 : waveHeight) + Math.sin(i * Math.PI / 2) * (waveHeight / 2)
    wavePoints.push([x, y])
  }
  
  // Dibujar rectángulo con gradiente simulado
  doc.setFillColor(waveColor[0], waveColor[1], waveColor[2])
  doc.rect(0, yPos, pageWidth, waveHeight, 'F')
  
  // Capa superior más clara para efecto de onda
  doc.setFillColor(waveColorLight[0], waveColorLight[1], waveColorLight[2])
  doc.rect(0, yPos + (isTop ? 0 : waveHeight / 2), pageWidth, waveHeight / 2, 'F')
}

// Función auxiliar para dibujar logo
function drawLogo(doc, x, y, width, height) {
  const logoColor = [0, 102, 204] // Azul #0066CC
  doc.setFillColor(logoColor[0], logoColor[1], logoColor[2])
  doc.setDrawColor(logoColor[0], logoColor[1], logoColor[2])
  doc.roundedRect(x, y, width, height, 3, 3, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('LOGO', x + width / 2, y + height / 2 + 2, { align: 'center' })
  doc.setTextColor(0, 0, 0)
}

export function generateQuotePDF(quote) {
  // Parsear productos (compatible con formato antiguo y nuevo con metadata)
  const productsData = typeof quote.products === 'string' 
    ? JSON.parse(quote.products) 
    : quote.products
  
  // Si tiene formato nuevo con metadata, usar items, sino usar directamente
  const products = productsData.items || productsData
  const documentType = productsData.documentType || 'boleta'
  const fiscalData = productsData.fiscalData || null
  const notFoundProducts = productsData.notFoundProducts || null

  // Crear PDF
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = 0

  // ========== ENCABEZADO AZUL SÓLIDO ==========
  const headerHeight = 20
  const headerColor = [0, 102, 204] // Azul #0066CC
  doc.setFillColor(headerColor[0], headerColor[1], headerColor[2])
  doc.rect(0, 0, pageWidth, headerHeight, 'F')
  
  yPos = headerHeight / 2

  // Logo en la esquina superior izquierda
  drawLogo(doc, margin, 3, 40, 14)

  // Título "FACTURA" o "BOLETA" en la parte superior derecha (en blanco)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  const docTitle = documentType === 'factura' ? 'FACTURA' : 'BOLETA'
  doc.text(docTitle, pageWidth - margin, yPos + 2, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  yPos = headerHeight + 15

  // ========== SECCIÓN DE DETALLES Y CLIENTE ==========
  const leftColumnX = margin
  const rightColumnX = pageWidth / 2 + 10

  // Columna izquierda: Detalles de la factura
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('DETALLES DE LA COTIZACIÓN', leftColumnX, yPos)
  yPos += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  // Usar el número de cotización secuencial si existe, sino usar el ID
  const quoteNumber = quote.quoteNumber 
    ? `Cotización ${String(quote.quoteNumber).padStart(7, '0')}`
    : `COT-${quote.id.slice(0, 8)}`
  doc.text(`Número: ${quoteNumber}`, leftColumnX, yPos)
  yPos += 6
  doc.text(`Fecha: ${new Date(quote.createdAt).toLocaleDateString('es-PE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, leftColumnX, yPos)
  yPos += 6
  doc.text(`Estado: ${quote.status.toUpperCase()}`, leftColumnX, yPos)

  // Columna derecha: Datos del cliente
  let rightYPos = 35
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('DATOS DEL CLIENTE', rightColumnX, rightYPos)
  rightYPos += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Nombre: ${quote.name}`, rightColumnX, rightYPos)
  rightYPos += 6
  
  // Si es factura, mostrar datos fiscales
  if (documentType === 'factura' && fiscalData) {
    doc.text(`RUC: ${fiscalData.ruc}`, rightColumnX, rightYPos)
    rightYPos += 6
    doc.text(`Razón Social: ${fiscalData.businessName}`, rightColumnX, rightYPos)
    rightYPos += 6
    doc.text(`Dirección: ${fiscalData.address}`, rightColumnX, rightYPos)
    rightYPos += 6
  }
  
  doc.text(`Teléfono: ${quote.whatsapp}`, rightColumnX, rightYPos)
  rightYPos += 6
  doc.text(`Email: ${quote.email}`, rightColumnX, rightYPos)

  yPos = Math.max(yPos, rightYPos) + 15

  // ========== TABLA DE PRODUCTOS ==========
  // Encabezado de tabla con fondo azul
  const tableStartY = yPos
  const tableHeaderHeight = 8
  const tableHeaderColor = [0, 102, 204] // Azul #0066CC
  
  doc.setFillColor(tableHeaderColor[0], tableHeaderColor[1], tableHeaderColor[2])
  doc.rect(margin, tableStartY - tableHeaderHeight, pageWidth - (margin * 2), tableHeaderHeight, 'F')

  // Texto del encabezado en blanco
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  
  const colWidths = [90, 25, 30, 30]
  const colX = [
    margin + 5,
    margin + colWidths[0] + 5,
    margin + colWidths[0] + colWidths[1] + 5,
    margin + colWidths[0] + colWidths[1] + colWidths[2] + 5
  ]
  
  doc.text('ITEM DESCRIPTION', colX[0], tableStartY - 2)
  doc.text('CANT.', colX[1], tableStartY - 2, { align: 'center' })
  doc.text('PRECIO', colX[2], tableStartY - 2, { align: 'right' })
  doc.text('TOTAL', colX[3], tableStartY - 2, { align: 'right' })

  doc.setTextColor(0, 0, 0)
  yPos = tableStartY + 3

  // Filas de productos
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  let itemNumber = 1

  products.forEach((product) => {
    if (yPos > pageHeight - 100) {
      doc.addPage()
      yPos = margin + 20
    }

    // Línea separadora
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2)

    const nameAndDesc = doc.splitTextToSize(
      product.description
        ? `${itemNumber}. ${product.name || 'Sin nombre'} - ${product.description}`
        : `${itemNumber}. ${product.name || 'Sin nombre'}`,
      colWidths[0] - 5
    )
    
    doc.text(nameAndDesc, colX[0], yPos)
    doc.text(String(product.quantity || 0), colX[1], yPos, { align: 'center' })
    doc.text(`S/. ${(product.price || 0).toFixed(2)}`, colX[2], yPos, { align: 'right' })
    doc.text(`S/. ${((product.price || 0) * (product.quantity || 0)).toFixed(2)}`, colX[3], yPos, { align: 'right' })
    
    yPos += Math.max(nameAndDesc.length * 4, 8)
    itemNumber++
  })

  // Productos no encontrados
  if (notFoundProducts && notFoundProducts.length > 0) {
    const validNotFound = notFoundProducts.filter(p => p.name && p.name.trim() !== '')
    if (validNotFound.length > 0) {
      if (yPos > pageHeight - 100) {
        doc.addPage()
        yPos = margin + 20
      }

      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2)
      yPos += 5

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('PRODUCTOS NO ENCONTRADOS (Solicitar cotización)', margin + 5, yPos)
      yPos += 6

      doc.setFont('helvetica', 'normal')
      validNotFound.forEach((product) => {
        if (yPos > pageHeight - 100) {
          doc.addPage()
          yPos = margin + 20
        }

        const nameText = doc.splitTextToSize(
          `${itemNumber}. ${product.name}${product.description ? ' - ' + product.description : ''}`,
          colWidths[0] + colWidths[1] - 5
        )
        
        doc.text(nameText, colX[0], yPos)
        doc.text(product.quantity || '1', colX[1], yPos, { align: 'center' })
        doc.text('Cotizar', colX[2], yPos, { align: 'right' })
        doc.text('-', colX[3], yPos, { align: 'right' })
        
        yPos += Math.max(nameText.length * 4, 8)
        itemNumber++
      })
    }
  }

  // ========== RESUMEN (SUB TOTAL, TAX, TOTAL) ==========
  const summaryStartX = pageWidth - margin - 80
  const summaryY = yPos + 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('SUB TOTAL:', summaryStartX, summaryY, { align: 'right' })
  doc.text(`S/. ${quote.total.toFixed(2)}`, pageWidth - margin - 5, summaryY, { align: 'right' })
  
  doc.text('IGV (18%):', summaryStartX, summaryY + 6, { align: 'right' })
  const igv = quote.total * 0.18
  doc.text(`S/. ${igv.toFixed(2)}`, pageWidth - margin - 5, summaryY + 6, { align: 'right' })
  
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(summaryStartX - 10, summaryY + 10, pageWidth - margin - 5, summaryY + 10)
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL:', summaryStartX, summaryY + 18, { align: 'right' })
  const totalWithTax = quote.total + igv
  doc.text(`S/. ${totalWithTax.toFixed(2)}`, pageWidth - margin - 5, summaryY + 18, { align: 'right' })

  // ========== INFORMACIÓN DE PAGO Y TÉRMINOS ==========
  const bottomSectionY = summaryY + 30
  let leftBottomY = bottomSectionY

  // Información de pago (izquierda)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('INFORMACIÓN DE PAGO', leftColumnX, leftBottomY)
  leftBottomY += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Cuenta: Por definir', leftColumnX, leftBottomY)
  leftBottomY += 5
  doc.text('Banco: Por definir', leftColumnX, leftBottomY)
  leftBottomY += 5
  doc.text('Detalles: Contactar para información', leftColumnX, leftBottomY)
  leftBottomY += 10

  // Términos y condiciones
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TÉRMINOS Y CONDICIONES', leftColumnX, leftBottomY)
  leftBottomY += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const terms = doc.splitTextToSize(
    'Esta es una cotización válida por 30 días. Los precios están sujetos a disponibilidad de stock. Para más información, contactar con nuestro equipo de ventas.',
    pageWidth / 2 - margin - 5
  )
  doc.text(terms, leftColumnX, leftBottomY)

  // Firma autorizada (derecha)
  const signatureY = summaryY + 30
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(rightColumnX, signatureY + 15, rightColumnX + 60, signatureY + 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('FIRMA AUTORIZADA', rightColumnX + 30, signatureY + 20, { align: 'center' })

  // ========== FOOTER AZUL SÓLIDO ==========
  const footerHeight = 25
  const footerY = pageHeight - footerHeight
  const footerColor = [0, 102, 204] // Azul #0066CC
  doc.setFillColor(footerColor[0], footerColor[1], footerColor[2])
  doc.rect(0, footerY, pageWidth, footerHeight, 'F')

  // Texto "GRACIAS POR SU PREFERENCIA" (en blanco)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('GRACIAS POR SU PREFERENCIA', margin + 10, footerY + 8)

  // Información de contacto (derecha, en blanco)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`Teléfono: ${quote.whatsapp}`, pageWidth - margin - 10, footerY + 5, { align: 'right' })
  doc.text(`Email: ${quote.email}`, pageWidth - margin - 10, footerY + 10, { align: 'right' })
  doc.text('www.ferreteria.com', pageWidth - margin - 10, footerY + 15, { align: 'right' })

  // Retornar como Buffer para uso en Node.js
  return Buffer.from(doc.output('arraybuffer'))
}
