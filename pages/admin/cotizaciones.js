import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { FiEye, FiCheck, FiX, FiDownload, FiFileText } from 'react-icons/fi'

export default function AdminCotizaciones() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState([])
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)

  useEffect(() => {
    checkAuth()
    fetchQuotes()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      if (res.ok) {
        const userData = await res.json()
        // Verificar que el usuario tenga un rol de administrador
        const adminRoles = ['admin', 'superadmin', 'editor', 'viewer']
        if (!adminRoles.includes(userData.role)) {
          window.location.href = '/'
          return
        }
        setUser(userData)
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Auth error:', error)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/cotizaciones')
      if (res.ok) {
        const data = await res.json()
        // Si no hay cotizaciones, usar datos ficticios
        if (data.length === 0) {
          setQuotes(getMockQuotes())
        } else {
          setQuotes(data)
        }
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
      // En caso de error, usar datos ficticios
      setQuotes(getMockQuotes())
    }
  }

  // Función para generar datos ficticios de cotizaciones
  const getMockQuotes = () => {
    const mockProducts1 = [
      { name: 'Pintura Latex Blanca 4L', quantity: 5, price: 35.99 },
      { name: 'Rodillo de Pintura Profesional', quantity: 3, price: 12.50 },
      { name: 'Brocha de Cerdas Naturales', quantity: 2, price: 8.75 },
    ]
    const mockProducts2 = [
      { name: 'Llave Inglesa Ajustable 10"', quantity: 2, price: 24.99 },
      { name: 'Destornillador Phillips #2', quantity: 4, price: 6.50 },
      { name: 'Martillo de Uña 16oz', quantity: 1, price: 18.75 },
      { name: 'Cinta Métrica 5m', quantity: 3, price: 4.25 },
    ]
    const mockProducts3 = [
      { name: 'Tornillos Autorroscantes #8 x 1"', quantity: 500, price: 0.15 },
      { name: 'Clavos para Madera 2.5"', quantity: 1000, price: 0.08 },
      { name: 'Pernos Hexagonales M8 x 50mm', quantity: 50, price: 0.45 },
    ]
    const mockProducts4 = [
      { name: 'Cable Eléctrico THWN #12', quantity: 100, price: 2.25 },
      { name: 'Interruptor Simple', quantity: 10, price: 8.50 },
      { name: 'Tomacorriente Doble', quantity: 8, price: 12.75 },
      { name: 'Caja Eléctrica 4x4', quantity: 15, price: 5.99 },
    ]
    const mockProducts5 = [
      { name: 'Cemento Portland 50kg', quantity: 10, price: 12.99 },
      { name: 'Arena Fina 1m³', quantity: 2, price: 45.00 },
      { name: 'Grava 3/4" 1m³', quantity: 2, price: 50.00 },
      { name: 'Varilla #3 6m', quantity: 20, price: 8.50 },
    ]

    const now = new Date()
    return [
      {
        id: 'mock-001',
        name: 'Juan Pérez García',
        email: 'juan.perez@email.com',
        whatsapp: '+52 555 123 4567',
        products: JSON.stringify(mockProducts1),
        total: mockProducts1.reduce((sum, p) => sum + p.price * p.quantity, 0),
        status: 'sent',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-002',
        name: 'María González López',
        email: 'maria.gonzalez@email.com',
        whatsapp: '+52 555 234 5678',
        products: JSON.stringify(mockProducts2),
        total: mockProducts2.reduce((sum, p) => sum + p.price * p.quantity, 0),
        status: 'completed',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-003',
        name: 'Carlos Rodríguez Martínez',
        email: 'carlos.rodriguez@email.com',
        whatsapp: '+52 555 345 6789',
        products: JSON.stringify(mockProducts3),
        total: mockProducts3.reduce((sum, p) => sum + p.price * p.quantity, 0),
        status: 'pending',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-004',
        name: 'Ana Martínez Sánchez',
        email: 'ana.martinez@email.com',
        whatsapp: '+52 555 456 7890',
        products: JSON.stringify(mockProducts4),
        total: mockProducts4.reduce((sum, p) => sum + p.price * p.quantity, 0),
        status: 'sent',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-005',
        name: 'Roberto Hernández Torres',
        email: 'roberto.hernandez@email.com',
        whatsapp: '+52 555 567 8901',
        products: JSON.stringify(mockProducts5),
        total: mockProducts5.reduce((sum, p) => sum + p.price * p.quantity, 0),
        status: 'pending',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  }

  const handleViewQuote = (quote) => {
    try {
      const products = JSON.parse(quote.products)
      setSelectedQuote({ ...quote, products })
      setShowModal(true)
    } catch (error) {
      console.error('Error parsing products:', error)
      setSelectedQuote({ ...quote, products: [] })
      setShowModal(true)
    }
  }

  const generatePdfFromQuote = async (quote) => {
    try {
      // Parsear productos (compatible con formato antiguo y nuevo con metadata)
      const productsData = typeof quote.products === 'string' 
        ? JSON.parse(quote.products) 
        : quote.products
      
      // Si tiene formato nuevo con metadata, usar items, sino usar directamente
      const products = productsData.items || productsData
      const documentType = productsData.documentType || 'boleta'
      const fiscalData = productsData.fiscalData || null

      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf')
      
      // Crear PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      let yPos = margin

      // Encabezado
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(documentType === 'factura' ? 'FACTURA' : 'BOLETA', pageWidth / 2, yPos, { align: 'center' })
      yPos += 10

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('FERRETERÍA', pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      // Información de la cotización
      doc.setFontSize(10)
      // Usar el número de cotización secuencial si existe
      const quoteNumber = quote.quoteNumber 
        ? `Cotización ${String(quote.quoteNumber).padStart(7, '0')}`
        : quote.id.slice(0, 8).toUpperCase()
      doc.text(`Número de Cotización: ${quoteNumber}`, margin, yPos)
      yPos += 6
      doc.text(`Fecha: ${new Date(quote.createdAt).toLocaleDateString('es-MX')}`, margin, yPos)
      yPos += 6
      doc.text(`Estado: ${quote.status.toUpperCase()}`, margin, yPos)
      yPos += 10

      // Información del cliente
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN DEL CLIENTE', margin, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text(`Nombre: ${quote.name}`, margin, yPos)
      yPos += 6
      
      // Si es factura, mostrar datos fiscales
      if (documentType === 'factura' && fiscalData) {
        doc.text(`RUC: ${fiscalData.ruc}`, margin, yPos)
        yPos += 6
        doc.text(`Razón Social: ${fiscalData.businessName}`, margin, yPos)
        yPos += 6
        doc.text(`Dirección Fiscal: ${fiscalData.address}`, margin, yPos)
        yPos += 6
      }
      
      doc.text(`Email: ${quote.email}`, margin, yPos)
      yPos += 6
      doc.text(`WhatsApp: ${quote.whatsapp}`, margin, yPos)
      yPos += 10

      // Tabla de productos
      doc.setFont('helvetica', 'bold')
      doc.text('PRODUCTOS', margin, yPos)
      yPos += 8

      // Encabezados de tabla
      const colWidths = [80, 30, 30, 30]
      const colX = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]]
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Producto', colX[0], yPos)
      doc.text('Cant.', colX[1], yPos, { align: 'center' })
      doc.text('Precio', colX[2], yPos, { align: 'right' })
      doc.text('Subtotal', colX[3], yPos, { align: 'right' })
      yPos += 5

      // Línea separadora
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 5

      // Productos
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      products.forEach((product) => {
        // Verificar si necesitamos una nueva página
        if (yPos > 250) {
          doc.addPage()
          yPos = margin
        }

        const nameAndDesc = doc.splitTextToSize(
          product.description
            ? `${product.name || 'Sin nombre'} - ${product.description}`
            : product.name || 'Sin nombre',
          colWidths[0] - 5
        )
        doc.text(nameAndDesc, colX[0], yPos)
        doc.text(String(product.quantity || 0), colX[1], yPos, { align: 'center' })
        doc.text(`S/. ${(product.price || 0).toFixed(2)}`, colX[2], yPos, { align: 'right' })
        doc.text(`S/. ${((product.price || 0) * (product.quantity || 0)).toFixed(2)}`, colX[3], yPos, {
          align: 'right',
        })
        yPos += nameAndDesc.length * 5 + 2
      })

      yPos += 5
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 8

      // Total
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('TOTAL:', colX[2], yPos, { align: 'right' })
      doc.text(`S/. ${quote.total.toFixed(2)}`, colX[3], yPos, { align: 'right' })

      // Pie de página
      yPos = doc.internal.pageSize.getHeight() - 30
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text('Gracias por su preferencia', pageWidth / 2, yPos, { align: 'center' })
      yPos += 5
      doc.text('Esta es una cotización, no una factura', pageWidth / 2, yPos, { align: 'center' })

      return doc
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw error
    }
  }

  const handleViewPdf = async (quote) => {
    try {
      // Si es un dato ficticio (id empieza con 'mock-'), generar PDF en el cliente
      if (quote.id.startsWith('mock-')) {
        const doc = await generatePdfFromQuote(quote)
        // Generar blob y crear URL
        const pdfBlob = doc.output('blob')
        const blobUrl = URL.createObjectURL(pdfBlob)
        setPdfUrl(blobUrl)
        setShowPdfModal(true)
      } else {
        // Para datos reales, usar el endpoint
        const pdfUrl = `/api/cotizaciones/${quote.id}/pdf`
        setPdfUrl(pdfUrl)
        setShowPdfModal(true)
      }
    } catch (error) {
      console.error('Error loading PDF:', error)
      alert('Error al cargar el PDF: ' + error.message)
    }
  }

  const handleDownloadPdf = async (quote) => {
    try {
      // Si es un dato ficticio, generar y descargar PDF en el cliente
      if (quote.id.startsWith('mock-')) {
        const doc = await generatePdfFromQuote(quote)
        doc.save(`cotizacion-${quote.id.slice(0, 8)}.pdf`)
      } else {
        // Para datos reales, usar el endpoint con parámetro de descarga
        window.open(`/api/cotizaciones/${quote.id}/pdf?download=1`, '_blank')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Error al descargar el PDF')
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/cotizaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        fetchQuotes()
      } else {
        alert('Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar estado')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completada'
      case 'sent':
        return 'Enviada'
      default:
        return 'Pendiente'
    }
  }

  return (
    <>
      <Head>
        <title>Cotizaciones - Panel Administrador</title>
      </Head>
      <AdminLayout user={user} onLogout={handleLogout}>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Cotizaciones</h1>
            <p className="text-gray-600 mt-1">
              {quotes.length} cotización{quotes.length !== 1 ? 'es' : ''} en total
            </p>
          </div>

          {/* Tabla de Cotizaciones */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No hay cotizaciones disponibles
                      </td>
                    </tr>
                  ) : (
                    quotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quote.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{quote.email}</div>
                          <div className="text-sm text-gray-500">{quote.whatsapp}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            S/. {quote.total.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              quote.status
                            )}`}
                          >
                            {getStatusLabel(quote.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(quote.createdAt).toLocaleDateString('es-MX')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(quote.createdAt).toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleViewQuote(quote)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalles"
                            >
                              <FiEye size={18} />
                            </button>
                            <button
                              onClick={() => handleViewPdf(quote)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Ver PDF"
                            >
                              <FiFileText size={18} />
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(quote)}
                              className="text-green-600 hover:text-green-900"
                              title="Descargar PDF"
                            >
                              <FiDownload size={18} />
                            </button>
                            {quote.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(quote.id, 'sent')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Marcar como enviada"
                                >
                                  <FiCheck size={18} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(quote.id, 'completed')}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Marcar como completada"
                                >
                                  <FiCheck size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal de Vista PDF */}
        {showPdfModal && pdfUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold text-gray-900">Vista Previa del PDF</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPdf(selectedQuote)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2"
                  >
                    <FiDownload size={18} />
                    Descargar
                  </button>
                  <button
                    onClick={() => {
                      setShowPdfModal(false)
                      setPdfUrl(null)
                      // Limpiar blob URL si existe
                      if (pdfUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(pdfUrl)
                      }
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-100 p-4">
                {pdfUrl && (
                  <embed
                    src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    type="application/pdf"
                    className="w-full h-full min-h-[600px]"
                    title="Vista previa del PDF"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalles */}
        {showModal && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Detalles de Cotización</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número de Cotización</label>
                    <p className="text-gray-900 font-semibold">
                      {selectedQuote.quoteNumber 
                        ? `Cotización ${String(selectedQuote.quoteNumber).padStart(7, '0')}`
                        : `#${selectedQuote.id.slice(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cliente</label>
                    <p className="text-gray-900 font-semibold">{selectedQuote.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedQuote.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                    <p className="text-gray-900">{selectedQuote.whatsapp}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        selectedQuote.status
                      )}`}
                    >
                      {getStatusLabel(selectedQuote.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">
                    Productos
                  </label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Producto
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                            Cantidad
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                            Precio Unit.
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedQuote.products?.map((product, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              <div className="font-medium">{product.name}</div>
                              {product.description && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {product.description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm text-center text-gray-900">
                              {product.quantity}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-gray-900">
                              S/. {product.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm text-right font-semibold text-gray-900">
                              S/. {(product.price * product.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-4 py-2 text-right font-semibold text-gray-900">
                            Total:
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-lg text-gray-900">
                            S/. {selectedQuote.total.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      // Cerrar el modal de detalles y mostrar solo la vista previa del PDF
                      setShowModal(false)
                      handleViewPdf(selectedQuote)
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <FiFileText size={18} />
                    Ver PDF
                  </button>
                  <button
                    onClick={() => handleDownloadPdf(selectedQuote)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <FiDownload size={18} />
                    Descargar PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedQuote(null)
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  )
}

