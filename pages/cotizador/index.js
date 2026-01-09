import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { FiCheck, FiX, FiSearch, FiDownload, FiFileText, FiPackage, FiClock, FiUser, FiMail, FiPhone, FiCalendar, FiEye, FiCheckCircle, FiXCircle, FiFilter, FiChevronUp, FiChevronDown, FiAlertCircle } from 'react-icons/fi'
import { checkCotizadorAuth } from '../../lib/cotizadorAuth'
import CotizadorLayout from '../../components/cotizador/CotizadorLayout'
import * as XLSX from 'xlsx'

export default function CotizadorPanel() {
  const router = useRouter()
  const { status: queryStatus } = router.query
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(queryStatus || 'all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [modalAction, setModalAction] = useState(null)
  const [estimatedDelivery, setEstimatedDelivery] = useState('')
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showDateFilters, setShowDateFilters] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchQuotes()
    }
  }, [user, statusFilter])

  useEffect(() => {
    if (queryStatus) {
      setStatusFilter(queryStatus)
    }
  }, [queryStatus])

  const checkAuth = async () => {
    const { user: userData, error } = await checkCotizadorAuth()
    if (error || !userData) {
      router.push('/login')
      return
    }
    setUser(userData)
    setLoading(false)
  }

  const fetchQuotes = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const res = await fetch(`/api/cotizaciones/cotizador?${params.toString()}`, {
        credentials: 'include',
      })
      
      if (res.ok) {
        const data = await res.json()
        console.log('Quotes fetched:', data)
        setQuotes(data)
      } else {
        console.error('Error fetching quotes:', res.status)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = (
        quote.name?.toLowerCase().includes(query) ||
        quote.email?.toLowerCase().includes(query) ||
        quote.whatsapp?.includes(query) ||
        (quote.quoteNumber && quote.quoteNumber.toString().includes(query))
      )
      if (!matchesSearch) return false
    }

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      const quoteDate = new Date(quote.createdAt)
      quoteDate.setHours(0, 0, 0, 0)
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        fromDate.setHours(0, 0, 0, 0)
        if (quoteDate < fromDate) return false
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (quoteDate > toDate) return false
      }
    }

    return true
  })

  const handleViewDetails = (quote) => {
    setSelectedQuote(quote)
    setShowDetailModal(true)
  }

  const handleViewPdf = async (quote) => {
    try {
      const res = await fetch(`/api/cotizaciones/${quote.id}/pdf`, {
        credentials: 'include',
      })
      
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        setPdfPreviewUrl(url)
        setShowPdfModal(true)
      } else {
        showNotification('Error al cargar el PDF', 'error')
      }
    } catch (error) {
      console.error('Error loading PDF:', error)
      showNotification('Error al cargar el PDF', 'error')
    }
  }

  const handleApprove = async () => {
    if (!selectedQuote) return

    setProcessing(true)
    try {
      const res = await fetch(`/api/cotizaciones/${selectedQuote.id}/aprobar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          estimatedDelivery: estimatedDelivery ? parseInt(estimatedDelivery) : null,
          notes: notes || null,
        }),
      })

      if (res.ok) {
        await fetchQuotes()
        setShowActionModal(false)
        setSelectedQuote(null)
        setModalAction(null)
        setEstimatedDelivery('')
        setNotes('')
        showNotification('Cotización aprobada exitosamente', 'success')
      } else {
        const error = await res.json()
        showNotification(`Error: ${error.error || 'No se pudo aprobar la cotización'}`, 'error')
      }
    } catch (error) {
      console.error('Error approving quote:', error)
      showNotification('Error al aprobar la cotización', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedQuote || !rejectionReason.trim()) {
      showNotification('Por favor ingresa una razón para el rechazo', 'warning')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch(`/api/cotizaciones/${selectedQuote.id}/rechazar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rejectionReason: rejectionReason,
        }),
      })

      if (res.ok) {
        await fetchQuotes()
        setShowActionModal(false)
        setSelectedQuote(null)
        setModalAction(null)
        setRejectionReason('')
        showNotification('Cotización rechazada', 'success')
      } else {
        const error = await res.json()
        showNotification(`Error: ${error.error || 'No se pudo rechazar la cotización'}`, 'error')
      }
    } catch (error) {
      console.error('Error rejecting quote:', error)
      showNotification('Error al rechazar la cotización', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const openActionModal = (quote, action) => {
    setSelectedQuote(quote)
    setModalAction(action)
    setShowActionModal(true)
    if (action === 'approve') {
      setEstimatedDelivery(quote.estimatedDelivery?.toString() || '')
      setNotes(quote.notes || '')
      setRejectionReason('')
    } else {
      setRejectionReason('')
      setEstimatedDelivery('')
      setNotes('')
    }
  }

  const exportToExcel = () => {
    // Preparar datos
    const data = filteredQuotes.map((quote, index) => {
      let products = []
      try {
        const productsData = typeof quote.products === 'string' 
          ? JSON.parse(quote.products || '{}')
          : quote.products || {}
        products = quote.productsParsed || productsData.items || productsData
        if (!Array.isArray(products)) products = []
      } catch (e) {
        products = []
      }
      
      return {
        'N°': index + 1,
        'N° Cotización': quote.quoteNumber || 'N/A',
        'Fecha': new Date(quote.createdAt).toLocaleDateString('es-PE'),
        'Cliente': quote.name,
        'Email': quote.email,
        'WhatsApp': quote.whatsapp,
        'Estado': quote.status === 'pending' ? 'Pendiente' : 
                  quote.status === 'approved' ? 'Aprobada' : 
                  quote.status === 'rejected' ? 'Rechazada' : quote.status,
        'Total (S/.)': quote.total?.toFixed(2) || '0.00',
        'Cant. Productos': products.length,
        'Productos': products.map(p => `${p.name} (x${p.quantity || 1})`).join('; '),
        'Stock': quote.allInStock ? 'En Stock' : quote.someInStock ? 'Stock Parcial' : 'Sin Stock',
        'Tiempo Entrega (días)': quote.estimatedDelivery || 'N/A',
        'Notas': quote.notes || '',
        'Razón Rechazo': quote.rejectionReason || '',
      }
    })

    // Crear workbook
    const wb = XLSX.utils.book_new()
    
    // Crear hoja de datos
    const ws = XLSX.utils.json_to_sheet(data, { header: Object.keys(data[0] || {}) })
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 5 },   // N°
      { wch: 12 },  // N° Cotización
      { wch: 12 },  // Fecha
      { wch: 25 },  // Cliente
      { wch: 30 },  // Email
      { wch: 15 },  // WhatsApp
      { wch: 12 },  // Estado
      { wch: 12 },  // Total
      { wch: 12 },  // Cant. Productos
      { wch: 50 },  // Productos
      { wch: 12 },  // Stock
      { wch: 15 },  // Tiempo Entrega
      { wch: 30 },  // Notas
      { wch: 30 },  // Razón Rechazo
    ]
    ws['!cols'] = colWidths
    
    // Agregar título y logo (usando celdas)
    XLSX.utils.sheet_add_aoa(ws, [
      ['CORPORACIÓN GRC - REPORTE DE COTIZACIONES'],
      ['ISO 9001:2015'],
      [`Fecha de exportación: ${new Date().toLocaleDateString('es-PE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`],
      [`Total de cotizaciones: ${filteredQuotes.length}`],
      [''], // Línea vacía
    ], { origin: 'A1' })
    
    // Mover los datos hacia abajo (después del encabezado)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    const headerRows = 5
    const newDataStart = headerRows + 1
    
    // Crear nueva hoja con el formato correcto
    const newWs = XLSX.utils.aoa_to_sheet([
      ['CORPORACIÓN GRC - REPORTE DE COTIZACIONES'],
      ['ISO 9001:2015'],
      [`Fecha de exportación: ${new Date().toLocaleDateString('es-PE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`],
      [`Total de cotizaciones: ${filteredQuotes.length}`],
      [''], // Línea vacía
      Object.keys(data[0] || {}), // Encabezados
      ...data.map(row => Object.values(row)) // Datos
    ])
    
    // Ajustar ancho de columnas
    newWs['!cols'] = colWidths
    
    // Estilos básicos (XLSX no soporta estilos completos, pero podemos usar formato)
    // Agregar bordes y formato básico usando celdas
    const range2 = XLSX.utils.decode_range(newWs['!ref'] || 'A1')
    
    // Agregar la hoja al workbook
    XLSX.utils.book_append_sheet(wb, newWs, 'Cotizaciones')
    
    // Guardar archivo
    const fileName = `cotizaciones-${dateFrom ? dateFrom.split('T')[0] : 'todas'}-${dateTo ? dateTo.split('T')[0] : new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    showNotification('Excel exportado exitosamente', 'success')
  }

  const exportToPDF = async () => {
    try {
      // Usar jsPDF para crear un PDF con todas las cotizaciones
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      let yPos = margin

      // Colores GRC
      const greenColor = [34, 197, 94]
      const darkGreen = [22, 163, 74]

      // Encabezado
      doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2])
      doc.rect(0, 0, pageWidth, 30, 'F')
      
      // Logo GRC (círculo)
      const logoX = margin
      const logoY = 5
      const logoRadius = 10
      doc.setFillColor(greenColor[0], greenColor[1], greenColor[2])
      doc.circle(logoX + logoRadius, logoY + logoRadius, logoRadius, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('GRC', logoX + logoRadius, logoY + logoRadius + 2, { align: 'center' })
      
      // Título
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('CORPORACIÓN GRC', pageWidth - margin, 12, { align: 'right' })
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Reporte de Cotizaciones', pageWidth - margin, 20, { align: 'right' })
      doc.setFontSize(8)
      doc.text('ISO 9001:2015', pageWidth - margin, 26, { align: 'right' })
      
      doc.setTextColor(0, 0, 0)
      yPos = 40

      // Información del reporte
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-PE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margin, yPos)
      yPos += 6
      
      if (dateFrom || dateTo) {
        doc.text(`Período: ${dateFrom ? new Date(dateFrom).toLocaleDateString('es-PE') : 'Inicio'} - ${dateTo ? new Date(dateTo).toLocaleDateString('es-PE') : 'Hoy'}`, margin, yPos)
        yPos += 6
      }
      
      doc.text(`Total de cotizaciones: ${filteredQuotes.length}`, margin, yPos)
      yPos += 10

      // Tabla de cotizaciones - Mejor distribución de columnas (ajustado para que el email se vea completo)
      const colWidths = [10, 18, 22, 32, 45, 20, 20]
      const colHeaders = ['N°', 'Cotización', 'Fecha', 'Cliente', 'Email', 'Estado', 'Total (S/.)']
      const colX = [
        margin,
        margin + colWidths[0],
        margin + colWidths[0] + colWidths[1],
        margin + colWidths[0] + colWidths[1] + colWidths[2],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5],
      ]

      // Encabezado de tabla con bordes
      const tableStartY = yPos
      doc.setFillColor(greenColor[0], greenColor[1], greenColor[2])
      doc.rect(margin, tableStartY - 8, pageWidth - (margin * 2), 8, 'F')
      
      // Bordes del encabezado
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.3)
      doc.line(margin, tableStartY - 8, margin, tableStartY)
      doc.line(pageWidth - margin, tableStartY - 8, pageWidth - margin, tableStartY)
      
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      
      colHeaders.forEach((header, idx) => {
        doc.text(header, colX[idx] + 2, tableStartY - 2)
        // Líneas verticales entre columnas en el encabezado
        if (idx < colHeaders.length - 1) {
          doc.setDrawColor(255, 255, 255)
          doc.setLineWidth(0.2)
          doc.line(colX[idx + 1], tableStartY - 8, colX[idx + 1], tableStartY)
        }
      })
      
      doc.setTextColor(0, 0, 0)
      yPos = tableStartY + 6

      // Filas de datos con mejor formato y bordes
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      
      filteredQuotes.forEach((quote, index) => {
        if (yPos > pageHeight - 35) {
          doc.addPage()
          yPos = margin + 20
          // Redibujar encabezado en nueva página
          doc.setFillColor(greenColor[0], greenColor[1], greenColor[2])
          doc.rect(margin, yPos - 8, pageWidth - (margin * 2), 8, 'F')
          doc.setDrawColor(255, 255, 255)
          doc.line(margin, yPos - 8, margin, yPos)
          doc.line(pageWidth - margin, yPos - 8, pageWidth - margin, yPos)
          doc.setTextColor(255, 255, 255)
          doc.setFont('helvetica', 'bold')
          colHeaders.forEach((header, idx) => {
            doc.text(header, colX[idx] + 2, yPos - 2)
            if (idx < colHeaders.length - 1) {
              doc.setDrawColor(255, 255, 255)
              doc.setLineWidth(0.2)
              doc.line(colX[idx + 1], yPos - 8, colX[idx + 1], yPos)
            }
          })
          doc.setTextColor(0, 0, 0)
          yPos += 6
        }

        const statusText = quote.status === 'pending' ? 'Pendiente' : 
                          quote.status === 'approved' ? 'Aprobada' : 
                          quote.status === 'rejected' ? 'Rechazada' : quote.status

        // Fondo alternado para mejor legibilidad
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 7, 'F')
        }

        // Bordes de la fila
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.2)
        // Línea inferior de la fila
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2)
        // Líneas verticales entre columnas
        colX.forEach((x, idx) => {
          if (idx > 0) {
            doc.line(x, yPos - 5, x, yPos + 2)
          }
        })
        // Bordes laterales
        doc.line(margin, yPos - 5, margin, yPos + 2)
        doc.line(pageWidth - margin, yPos - 5, pageWidth - margin, yPos + 2)

        // Número - centrado
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        doc.text(String(index + 1), colX[0] + colWidths[0] / 2, yPos, { align: 'center' })
        
        // Cotización
        doc.text(String(quote.quoteNumber || 'N/A'), colX[1] + 2, yPos)
        
        // Fecha
        doc.text(new Date(quote.createdAt).toLocaleDateString('es-PE'), colX[2] + 2, yPos)
        
        // Cliente - truncar si es muy largo
        const clientName = (quote.name || 'N/A').substring(0, 25)
        doc.text(clientName, colX[3] + 2, yPos)
        
        // Email - tamaño normal, se ajusta automáticamente
        const email = quote.email || 'N/A'
        doc.setFontSize(7.5)
        doc.text(email, colX[4] + 2, yPos)
        doc.setFontSize(8)
        
        // Estado
        doc.text(statusText, colX[5] + 2, yPos)
        
        // Total - alineado a la derecha
        doc.setFont('helvetica', 'bold')
        doc.text(`S/. ${quote.total?.toFixed(2) || '0.00'}`, colX[6] + colWidths[6] - 2, yPos, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        
        // Espaciado entre filas
        yPos += 7
      })

      // Pie de página
      const footerY = pageHeight - 15
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('Corporación GRC - Av. José Gálvez 1322 Dpto. 302 La Perla - Callao', pageWidth / 2, footerY, { align: 'center' })
      doc.text('Tel: (511) 957 216 908 | Email: corporaciongrc@gmail.com', pageWidth / 2, footerY + 5, { align: 'center' })

      // Guardar PDF
      const fileName = `cotizaciones-${dateFrom ? dateFrom.split('T')[0] : 'todas'}-${dateTo ? dateTo.split('T')[0] : new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      showNotification('PDF exportado exitosamente', 'success')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      showNotification('Error al exportar PDF', 'error')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pendiente', class: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Aprobada', class: 'bg-green-100 text-green-800' },
      authorized: { text: 'Autorizada', class: 'bg-blue-100 text-blue-800' },
      dispatched: { text: 'Despachada', class: 'bg-purple-100 text-purple-800' },
      completed: { text: 'Completada', class: 'bg-green-100 text-green-800' },
      rejected: { text: 'Rechazada', class: 'bg-red-100 text-red-800' },
    }
    return badges[status] || badges.pending
  }

  const getStockBadge = (quote) => {
    if (quote.allInStock) {
      return { text: 'En Stock', class: 'bg-green-100 text-green-800' }
    } else if (quote.someInStock) {
      return { text: 'Stock Parcial', class: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { text: 'Sin Stock', class: 'bg-red-100 text-red-800' }
    }
  }

  const showNotification = (message, type = 'success') => {
    const id = Date.now()
    const notification = { id, message, type }
    setNotifications(prev => [...prev, notification])
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }

  if (loading) {
    return (
      <CotizadorLayout user={user} loading={loading}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </CotizadorLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Panel de Cotizador - Corporación GRC</title>
      </Head>
      <CotizadorLayout user={user}>
        <div className="space-y-6">
          {/* Filtros y Búsqueda - Diseño Compacto */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Header compacto */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiSearch size={18} className="text-white" />
                <h2 className="text-base font-bold text-white">Filtros</h2>
                {(dateFrom || dateTo) && (
                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs text-white">
                    Filtro activo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDateFilters(!showDateFilters)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-white text-xs font-medium transition-colors"
                >
                  <FiCalendar size={14} />
                  <span>Fechas</span>
                  {showDateFilters ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded text-white text-xs font-medium transition-colors"
                >
                  <FiFileText size={14} />
                  <span>PDF</span>
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded text-white text-xs font-medium transition-colors"
                >
                  <FiDownload size={14} />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Filtros principales en una fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="md:col-span-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar por cliente, email, WhatsApp o número..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      router.push(`/cotizador${e.target.value !== 'all' ? `?status=${e.target.value}` : ''}`)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white text-sm"
                    style={{ color: '#111827' }}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="approved">Aprobadas</option>
                    <option value="rejected">Rechazadas</option>
                  </select>
                </div>
              </div>

              {/* Filtros de Fecha - Colapsable */}
              {showDateFilters && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-green-600" size={14} />
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white text-sm"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-green-600" size={14} />
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="w-full pl-8 pr-2 py-1.5 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white text-sm"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setDateFrom('')
                          setDateTo('')
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <FiX size={14} />
                        <span>Limpiar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
                <span>Mostrando {filteredQuotes.length} de {quotes.length} cotizaciones</span>
              </div>
            </div>
          </div>

          {/* Cards de Cotizaciones - 4 columnas */}
          {filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No hay cotizaciones {statusFilter !== 'all' ? `con estado "${statusFilter}"` : ''}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredQuotes.map((quote) => {
                const statusBadge = getStatusBadge(quote.status)
                const stockBadge = getStockBadge(quote)
                let products = []
                try {
                  products = quote.productsParsed || JSON.parse(quote.products || '[]')
                } catch (e) {
                  products = []
                }

                return (
                  <div key={quote.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
                    {/* Header de la Card */}
                    <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">
                          #{quote.quoteNumber || 'N/A'}
                        </h3>
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge.class}`}>
                            {statusBadge.text}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${stockBadge.class}`}>
                            {stockBadge.text}
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        S/. {quote.total?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-green-100 mt-1">
                        {new Date(quote.createdAt).toLocaleDateString('es-PE')}
                      </div>
                    </div>

                    {/* Contenido de la Card */}
                    <div className="p-4 space-y-3">
                      {/* Información del Cliente */}
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FiUser size={14} className="text-gray-400" />
                          <span className="font-medium truncate">{quote.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 text-xs">
                          <FiMail size={14} className="text-gray-400" />
                          <span className="truncate">{quote.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600 text-xs">
                          <FiPhone size={14} className="text-gray-400" />
                          <span>{quote.whatsapp}</span>
                        </div>
                      </div>

                      {/* Productos - Resumen */}
                      <div className="border-t pt-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <FiPackage size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-700">Productos ({products.length})</span>
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {products.slice(0, 2).map((p, idx) => (
                            <span key={idx}>
                              {p.name} x{p.quantity || 1}
                              {idx < Math.min(products.length, 2) - 1 ? ', ' : ''}
                            </span>
                          ))}
                          {products.length > 2 && <span className="text-gray-400"> +{products.length - 2} más</span>}
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex flex-col space-y-2 pt-2 border-t">
                        <button
                          onClick={() => handleViewDetails(quote)}
                          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors shadow-sm"
                        >
                          <FiEye size={16} />
                          <span>VER</span>
                        </button>
                        {quote.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => openActionModal(quote, 'approve')}
                              className="flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded-lg text-xs transition-colors shadow-sm"
                            >
                              <FiCheckCircle size={14} />
                              <span>ACEPTAR</span>
                            </button>
                            <button
                              onClick={() => openActionModal(quote, 'reject')}
                              className="flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded-lg text-xs transition-colors shadow-sm"
                            >
                              <FiXCircle size={14} />
                              <span>RECHAZAR</span>
                            </button>
                          </div>
                        )}
                        {quote.status === 'approved' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center space-x-2 text-green-800">
                              <FiCheckCircle size={14} className="text-green-600" />
                              <span className="text-xs font-semibold">Cotización Aprobada</span>
                            </div>
                            <div className="text-xs text-green-700">
                              Esperando autorización del administrador
                            </div>
                            {quote.estimatedDelivery && (
                              <div className="flex items-center space-x-2 text-green-700 text-xs">
                                <FiClock size={12} />
                                <span>Entrega: {quote.estimatedDelivery} días</span>
                              </div>
                            )}
                            {quote.notes && (
                              <div className="text-xs text-green-700 line-clamp-2">
                                <span className="font-medium">Nota: </span>
                                {quote.notes}
                              </div>
                            )}
                          </div>
                        )}
                        {quote.status === 'authorized' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center space-x-2 text-blue-800">
                              <FiCheckCircle size={14} className="text-blue-600" />
                              <span className="text-xs font-semibold">Despacho Autorizado</span>
                            </div>
                            {quote.documentType && quote.documentNumber && (
                              <div className="text-xs text-blue-700">
                                <span className="font-medium">{quote.documentType === 'factura' ? 'Factura' : 'Boleta'}: </span>
                                {quote.documentNumber}
                              </div>
                            )}
                            {quote.authorizedAt && (
                              <div className="text-xs text-blue-600">
                                Autorizada: {new Date(quote.authorizedAt).toLocaleDateString('es-PE')}
                              </div>
                            )}
                          </div>
                        )}
                        {quote.status === 'dispatched' && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center space-x-2 text-purple-800">
                              <FiCheckCircle size={14} className="text-purple-600" />
                              <span className="text-xs font-semibold">Despachada</span>
                            </div>
                            {quote.dispatchedAt && (
                              <div className="text-xs text-purple-600">
                                Despachada: {new Date(quote.dispatchedAt).toLocaleDateString('es-PE')}
                              </div>
                            )}
                          </div>
                        )}
                        {quote.status === 'completed' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center space-x-2 text-green-800">
                              <FiCheckCircle size={14} className="text-green-600" />
                              <span className="text-xs font-semibold">Completada</span>
                            </div>
                            <div className="text-xs text-green-600">
                              Orden finalizada
                            </div>
                          </div>
                        )}
                        {quote.status === 'rejected' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2 text-red-800 mb-1">
                              <FiXCircle size={14} className="text-red-600" />
                              <span className="text-xs font-semibold">Cotización Rechazada</span>
                            </div>
                            {quote.rejectionReason && (
                              <div className="text-xs text-red-700 line-clamp-2">
                                {quote.rejectionReason}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal de Detalles */}
        {showDetailModal && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8 shadow-2xl">
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Cotización #{selectedQuote.quoteNumber || 'N/A'}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedQuote.status).class}`}>
                        {getStatusBadge(selectedQuote.status).text}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStockBadge(selectedQuote).class}`}>
                        {getStockBadge(selectedQuote).text}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">S/. {selectedQuote.total?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-green-100 mt-1">
                      {new Date(selectedQuote.createdAt).toLocaleDateString('es-PE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Información del Cliente */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiUser size={20} className="text-green-600" />
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 font-medium">Nombre:</span>
                      <span className="text-gray-900">{selectedQuote.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMail size={16} className="text-gray-400" />
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-900">{selectedQuote.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPhone size={16} className="text-gray-400" />
                      <span className="text-gray-600 font-medium">WhatsApp:</span>
                      <span className="text-gray-900">{selectedQuote.whatsapp}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiCalendar size={16} className="text-gray-400" />
                      <span className="text-gray-600 font-medium">Fecha:</span>
                      <span className="text-gray-900">
                        {new Date(selectedQuote.createdAt).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Productos con Stock */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiPackage size={20} className="text-green-600" />
                    Productos ({(() => {
                      try {
                        const productsData = typeof selectedQuote.products === 'string' 
                          ? JSON.parse(selectedQuote.products || '{}')
                          : selectedQuote.products || {}
                        const prods = selectedQuote.productsParsed || productsData.items || productsData
                        return Array.isArray(prods) ? prods.length : 0
                      } catch {
                        return 0
                      }
                    })()})
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      try {
                        const productsData = typeof selectedQuote.products === 'string' 
                          ? JSON.parse(selectedQuote.products || '{}')
                          : selectedQuote.products || {}
                        const products = selectedQuote.productsParsed || productsData.items || productsData
                        
                        if (!Array.isArray(products) || products.length === 0) {
                          return (
                            <div className="text-gray-500 text-center py-4">
                              No hay productos en esta cotización
                            </div>
                          )
                        }
                        
                        return products.map((product, idx) => {
                          const stock = product.stock || 0
                          const quantity = product.quantity || 1
                          const hasStock = stock >= quantity
                          const stockShortage = stock < quantity
                          const stockCritical = stock === 0
                          const stockLow = stock > 0 && stock < 10
                          
                          // Determinar el estado del stock
                          let stockStatus, stockClass, stockIcon
                          if (stockCritical) {
                            stockStatus = 'Sin Stock'
                            stockClass = 'bg-red-100 text-red-800 border-red-300'
                            stockIcon = <FiXCircle size={16} className="text-red-600" />
                          } else if (stockLow) {
                            stockStatus = 'Stock Bajo'
                            stockClass = 'bg-orange-100 text-orange-800 border-orange-300'
                            stockIcon = <FiAlertCircle size={16} className="text-orange-600" />
                          } else if (stockShortage) {
                            stockStatus = `Stock Insuficiente (Faltan ${quantity - stock})`
                            stockClass = 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            stockIcon = <FiAlertCircle size={16} className="text-yellow-600" />
                          } else {
                            stockStatus = 'Disponible'
                            stockClass = 'bg-green-100 text-green-800 border-green-300'
                            stockIcon = <FiCheckCircle size={16} className="text-green-600" />
                          }
                          
                          return (
                            <div key={idx} className={`border-2 rounded-lg p-4 hover:shadow-md transition-all ${
                              stockCritical ? 'border-red-300 bg-red-50' :
                              stockLow ? 'border-orange-300 bg-orange-50' :
                              stockShortage ? 'border-yellow-300 bg-yellow-50' :
                              'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    {stockIcon}
                                    <div className="font-semibold text-gray-900">{product.name || 'Sin nombre'}</div>
                                  </div>
                                  {product.description && (
                                    <div className="text-xs text-gray-600 mt-1 italic mb-2">{product.description}</div>
                                  )}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div>
                                      <span className="text-gray-600">Cantidad solicitada:</span>
                                      <span className="font-bold text-gray-900 ml-1">{quantity}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Stock disponible:</span>
                                      <span className={`font-bold ml-1 ${
                                        stockCritical ? 'text-red-600' :
                                        stockLow ? 'text-orange-600' :
                                        stockShortage ? 'text-yellow-600' :
                                        'text-green-600'
                                      }`}>{stock}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Precio unitario:</span>
                                      <span className="font-semibold text-gray-900 ml-1">S/. {product.price?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Subtotal:</span>
                                      <span className="font-bold text-green-600 ml-1">S/. {((product.price || 0) * quantity).toFixed(2)}</span>
                                    </div>
                                  </div>
                                  {stockShortage && (
                                    <div className="mt-2 flex items-center space-x-2 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2">
                                      <FiAlertCircle size={14} />
                                      <span className="text-xs font-medium">
                                        ⚠️ Faltan {quantity - stock} unidades para completar el pedido
                                      </span>
                                    </div>
                                  )}
                                  {stockCritical && (
                                    <div className="mt-2 flex items-center space-x-2 text-red-700 bg-red-100 border border-red-300 rounded px-3 py-2">
                                      <FiXCircle size={14} />
                                      <span className="text-xs font-medium">
                                        ❌ Producto sin stock - Requiere reposición
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4 text-right">
                                  <div className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${stockClass}`}>
                                    <div className="flex items-center space-x-1">
                                      {stockIcon}
                                      <span>{stockStatus}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      } catch (e) {
                        console.error('Error parsing products:', e)
                        return (
                          <div className="text-red-500 text-center py-4">
                            Error al cargar productos: {e.message}
                          </div>
                        )
                      }
                    })()}
                  </div>
                </div>

                {/* Información adicional para aprobadas */}
                {selectedQuote.status === 'approved' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <FiCheckCircle size={20} />
                      Información de Aprobación
                    </h3>
                    {selectedQuote.estimatedDelivery && (
                      <div className="flex items-center space-x-2 text-green-800 mb-2">
                        <FiClock size={16} />
                        <span className="font-medium">Tiempo de entrega estimado:</span>
                        <span>{selectedQuote.estimatedDelivery} días</span>
                      </div>
                    )}
                    {selectedQuote.notes && (
                      <div className="text-green-800">
                        <span className="font-medium">Notas:</span>
                        <p className="mt-1">{selectedQuote.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Razón de rechazo */}
                {selectedQuote.status === 'rejected' && selectedQuote.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <FiXCircle size={20} />
                      Razón del Rechazo
                    </h3>
                    <p className="text-red-800">{selectedQuote.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Footer del Modal */}
              <div className="bg-gray-50 border-t border-gray-200 p-6 rounded-b-lg">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleViewPdf(selectedQuote)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <FiFileText size={18} />
                    <span>Ver PDF</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    {selectedQuote.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setShowDetailModal(false)
                            openActionModal(selectedQuote, 'approve')
                          }}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                          <FiCheckCircle size={18} />
                          <span>Aprobar</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowDetailModal(false)
                            openActionModal(selectedQuote, 'reject')
                          }}
                          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                          <FiXCircle size={18} />
                          <span>Rechazar</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowDetailModal(false)
                        setSelectedQuote(null)
                      }}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors shadow-sm"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Previsualización PDF */}
        {showPdfModal && pdfPreviewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold text-gray-900">Vista Previa del PDF</h3>
                <div className="flex gap-2">
                  <a
                    href={pdfPreviewUrl}
                    download={`cotizacion-${selectedQuote?.quoteNumber || selectedQuote?.id}.pdf`}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2"
                  >
                    <FiDownload size={18} />
                    Descargar
                  </a>
                  <button
                    onClick={() => {
                      setShowPdfModal(false)
                      if (pdfPreviewUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(pdfPreviewUrl)
                      }
                      setPdfPreviewUrl(null)
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-100 p-4">
                <iframe
                  src={`${pdfPreviewUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  type="application/pdf"
                  className="w-full h-full min-h-[600px] border-0"
                  title="Vista previa del PDF"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal para Aprobar/Rechazar */}
        {showActionModal && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {modalAction === 'approve' ? 'Aprobar Cotización' : 'Rechazar Cotización'}
              </h2>

              {modalAction === 'approve' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo de entrega estimado (días)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      placeholder="Ej: 5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notas adicionales sobre la cotización..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowActionModal(false)
                        setSelectedQuote(null)
                        setModalAction(null)
                      }}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 text-white"
                    >
                      {processing ? 'Procesando...' : 'Aprobar'}
                    </button>
                  </div>
                </div>
              )}

              {modalAction === 'reject' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razón del rechazo *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Ingresa la razón por la cual rechazas esta cotización..."
                      rows={4}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowActionModal(false)
                        setSelectedQuote(null)
                        setModalAction(null)
                      }}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition-colors text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={processing || !rejectionReason.trim()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 text-white"
                    >
                      {processing ? 'Procesando...' : 'Rechazar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notificaciones Toast */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => {
            const bgColor = notification.type === 'success' 
              ? 'bg-green-600' 
              : notification.type === 'error' 
              ? 'bg-red-600' 
              : 'bg-yellow-600'
            
            const icon = notification.type === 'success' 
              ? <FiCheckCircle size={20} />
              : notification.type === 'error'
              ? <FiXCircle size={20} />
              : <FiX size={20} />
            
            return (
              <div
                key={notification.id}
                className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] max-w-md animate-slide-in-right`}
                style={{
                  animation: 'slideInRight 0.3s ease-out'
                }}
              >
                {icon}
                <span className="flex-1 font-medium">{notification.message}</span>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            )
          })}
        </div>
      </CotizadorLayout>
    </>
  )
}
