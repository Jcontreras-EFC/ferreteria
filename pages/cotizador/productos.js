import { useState, useEffect } from 'react'
import Head from 'next/head'
import { FiPackage, FiSearch, FiAlertCircle, FiCheckCircle, FiXCircle, FiFilter, FiGrid, FiList, FiDownload, FiFileText } from 'react-icons/fi'
import { checkCotizadorAuth } from '../../lib/cotizadorAuth'
import CotizadorLayout from '../../components/cotizador/CotizadorLayout'
import * as XLSX from 'xlsx'

export default function CotizadorProductos() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // all, low, medium, high, out
  const [viewMode, setViewMode] = useState('table') // 'cards' or 'table'

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user])

  const checkAuth = async () => {
    const { user: userData, error } = await checkCotizadorAuth()
    if (error || !userData) {
      window.location.href = '/login'
      return
    }
    setUser(userData)
    setLoading(false)
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/productos', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Sin Stock', color: 'red', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
    if (stock < 10) return { label: 'Stock Bajo', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' }
    if (stock < 50) return { label: 'Stock Medio', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' }
    return { label: 'Stock Alto', color: 'green', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const stock = product.stock || 0
    let matchesStock = true
    if (stockFilter === 'out') {
      matchesStock = stock === 0
    } else if (stockFilter === 'low') {
      matchesStock = stock > 0 && stock < 10
    } else if (stockFilter === 'medium') {
      matchesStock = stock >= 10 && stock < 50
    } else if (stockFilter === 'high') {
      matchesStock = stock >= 50
    }

    return matchesSearch && matchesStock
  })

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
    lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length,
    mediumStock: products.filter(p => (p.stock || 0) >= 10 && (p.stock || 0) < 50).length,
    highStock: products.filter(p => (p.stock || 0) >= 50).length,
  }

  const exportToExcel = () => {
    const data = filteredProducts.map((product, index) => ({
      'N°': index + 1,
      'Nombre': product.name,
      'Descripción': product.description || '',
      'Precio': product.price?.toFixed(2) || '0.00',
      'Stock': product.stock || 0,
      'Estado Stock': getStockStatus(product.stock || 0).label,
      'Categoría': product.category || '',
    }))

    const wb = XLSX.utils.book_new()
    const newWs = XLSX.utils.aoa_to_sheet([
      ['CORPORACIÓN GRC - REPORTE DE PRODUCTOS'],
      ['ISO 9001:2015'],
      [`Fecha de exportación: ${new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`],
      [`Total de productos: ${filteredProducts.length}`],
      [''],
      Object.keys(data[0] || {}),
      ...data.map(row => Object.values(row))
    ])

    const colWidths = [
      { wch: 5 }, { wch: 30 }, { wch: 50 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 20 }
    ]
    newWs['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, newWs, 'Productos')
    const fileName = `productos-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 15
      let yPos = margin

      // Encabezado
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, pageWidth, 30, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('CORPORACIÓN GRC', pageWidth - margin, 12, { align: 'right' })
      doc.setFontSize(14)
      doc.text('Reporte de Productos', pageWidth - margin, 20, { align: 'right' })
      doc.setFontSize(10)
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
      doc.text(`Total de productos: ${filteredProducts.length}`, margin, yPos)
      yPos += 10

      // Tabla
      const colWidths = [12, 60, 20, 20, 28]
      const colHeaders = ['N°', 'Producto', 'Precio', 'Stock', 'Estado']
      const colX = [
        margin,
        margin + colWidths[0],
        margin + colWidths[0] + colWidths[1],
        margin + colWidths[0] + colWidths[1] + colWidths[2],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
      ]
      const tableWidth = pageWidth - (margin * 2)
      const rowHeight = 8

      // Encabezado de tabla
      doc.setFillColor(59, 130, 246)
      doc.rect(margin, yPos - rowHeight, tableWidth, rowHeight, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      
      colHeaders.forEach((header, idx) => {
        const cellCenterX = colX[idx] + colWidths[idx] / 2
        doc.text(header, cellCenterX, yPos - 3, { align: 'center' })
      })
      
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(0.3)
      for (let i = 1; i < colX.length; i++) {
        doc.line(colX[i], yPos - rowHeight, colX[i], yPos)
      }
      
      doc.setTextColor(0, 0, 0)
      yPos += 2

      // Filas
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      filteredProducts.forEach((product, index) => {
        if (yPos > pageHeight - 30) {
          doc.addPage()
          yPos = margin + 20
          doc.setFillColor(59, 130, 246)
          doc.rect(margin, yPos - rowHeight, tableWidth, rowHeight, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          colHeaders.forEach((header, idx) => {
            const cellCenterX = colX[idx] + colWidths[idx] / 2
            doc.text(header, cellCenterX, yPos - 3, { align: 'center' })
          })
          doc.setDrawColor(255, 255, 255)
          doc.setLineWidth(0.3)
          for (let i = 1; i < colX.length; i++) {
            doc.line(colX[i], yPos - rowHeight, colX[i], yPos)
          }
          doc.setTextColor(0, 0, 0)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          yPos += 2
        }

        const rowStartY = yPos - 5
        const rowEndY = yPos + 1

        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245)
          doc.rect(margin, rowStartY, tableWidth, rowHeight, 'F')
        }

        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.2)
        doc.line(margin, rowEndY, pageWidth - margin, rowEndY)
        for (let i = 1; i < colX.length; i++) {
          doc.line(colX[i], rowStartY, colX[i], rowEndY)
        }
        doc.line(margin, rowStartY, margin, rowEndY)
        doc.line(pageWidth - margin, rowStartY, pageWidth - margin, rowEndY)

        const cellCenterY = rowStartY + rowHeight / 2 + 2
        const stockStatus = getStockStatus(product.stock || 0)
        
        doc.text(String(index + 1), colX[0] + colWidths[0] / 2, cellCenterY, { align: 'center' })
        doc.text((product.name || 'N/A').substring(0, 40), colX[1] + 3, cellCenterY)
        doc.setFont('helvetica', 'bold')
        doc.text(`S/. ${(product.price || 0).toFixed(2)}`, colX[2] + colWidths[2] - 3, cellCenterY, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.text(String(product.stock || 0), colX[3] + colWidths[3] / 2, cellCenterY, { align: 'center' })
        doc.setFontSize(7.5)
        doc.text(stockStatus.label, colX[4] + colWidths[4] / 2, cellCenterY, { align: 'center' })
        doc.setFontSize(8)
        
        yPos += rowHeight + 1
      })

      // Pie de página
      const footerY = pageHeight - 20
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('Corporación GRC - Av. José Gálvez 1322 Dpto. 302 La Perla - Callao', margin, footerY)
      doc.text('Email: corporaciongrc@gmail.com | WhatsApp: (511) 957 216 908', margin, footerY + 5)
      doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth - margin, footerY + 5, { align: 'right' })

      const pdfBlob = doc.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-productos-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  if (loading || !user) {
    return (
      <CotizadorLayout user={user} loading={loading}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </CotizadorLayout>
    )
  }

  return (
    <CotizadorLayout user={user} loading={false}>
      <Head>
        <title>Productos - Panel Cotizador</title>
      </Head>

      <div className="space-y-4">
        {/* Header Compacto con Estadísticas */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">INVENTARIO DE PRODUCTOS</h1>
              <p className="text-gray-600 text-xs mt-0.5">
                {products.length} producto{products.length !== 1 ? 's' : ''} en total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Vista de cards"
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Vista de tabla"
              >
                <FiList size={16} />
              </button>
            </div>
          </div>

          {/* Estadísticas Compactas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border-2 border-blue-300 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-blue-800 text-xs font-semibold">Total</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <FiPackage className="text-white" size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border-2 border-red-300 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-red-800 text-xs font-semibold">Sin Stock</span>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                  <FiXCircle className="text-white" size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-900">{stats.outOfStock}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border-2 border-orange-300 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-orange-800 text-xs font-semibold">Stock Bajo</span>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <FiAlertCircle className="text-white" size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-900">{stats.lowStock}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border-2 border-yellow-300 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-yellow-800 text-xs font-semibold">Stock Medio</span>
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                  <FiAlertCircle className="text-white" size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{stats.mediumStock}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border-2 border-green-300 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-green-800 text-xs font-semibold">Stock Alto</span>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <FiCheckCircle className="text-white" size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.highStock}</p>
            </div>
          </div>
        </div>

        {/* Filtros Compactos en una sola fila */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Título de Filtros */}
              <div className="flex items-center gap-2 mr-2">
                <FiFilter size={16} className="text-gray-600" />
                <h2 className="text-sm font-bold text-gray-800">Filtros</h2>
                {(searchQuery || stockFilter !== 'all') && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                    Filtros activos
                  </span>
                )}
              </div>

              {/* Búsqueda */}
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
                  style={{ color: '#111827' }}
                />
              </div>

              {/* Filtro por Stock */}
              <div className="min-w-[150px]">
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white text-sm"
                  style={{ color: '#111827' }}
                >
                  <option value="all">Todos</option>
                  <option value="out">Sin Stock</option>
                  <option value="low">Stock Bajo (&lt;10)</option>
                  <option value="medium">Stock Medio (10-49)</option>
                  <option value="high">Stock Alto (≥50)</option>
                </select>
              </div>

              {/* Botones de Exportar */}
              <button
                onClick={exportToExcel}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              >
                <FiDownload size={14} />
                <span>Excel</span>
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              >
                <FiFileText size={14} />
                <span>PDF</span>
              </button>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center justify-between text-xs text-gray-600 pt-2 mt-2 border-t border-gray-200">
              <span>Mostrando {filteredProducts.length} de {products.length} productos</span>
            </div>
          </div>
        </div>

        {/* Vista de Cards o Tabla */}
        {viewMode === 'cards' ? (
          /* Vista de Cards */
          filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
              <FiPackage className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600 text-lg">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const stock = product.stock || 0
                const stockStatus = getStockStatus(stock)
                
                return (
                  <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
                    {/* Header de la Card */}
                    <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold truncate">{product.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${stockStatus.bg} ${stockStatus.text} ${stockStatus.border}`}>
                          {stockStatus.label}
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        S/. {product.price?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-green-100 mt-1">
                        Stock: {stock} unidades
                      </div>
                    </div>

                    {/* Contenido de la Card */}
                    <div className="p-4 space-y-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.png'
                          }}
                        />
                      )}
                      {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      )}
                      {product.category && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Categoría:</span> {product.category}
                        </div>
                      )}
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border-2 ${stockStatus.bg} ${stockStatus.text} ${stockStatus.border} w-full justify-center`}>
                        <span className="font-bold text-lg mr-2">{stock}</span>
                        <span className="text-sm font-semibold">{stockStatus.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          /* Vista de Tabla */
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-indigo-700">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FiPackage size={14} />
                        Producto
                      </div>
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Categoría
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <FiPackage className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-600 text-lg">No se encontraron productos</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, index) => {
                      const stock = product.stock || 0
                      const stockStatus = getStockStatus(stock)
                      
                      return (
                        <tr 
                          key={product.id} 
                          className={`transition-colors ${
                            index % 2 === 0 
                              ? 'bg-white hover:bg-green-50' 
                              : 'bg-gray-50 hover:bg-green-50'
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.target.src = '/placeholder-product.png'
                                  }}
                                />
                              )}
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                                {product.description && (
                                  <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-base font-bold text-green-600">
                              S/. {product.price?.toFixed(2) || '0.00'}
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-base font-bold text-gray-900">{stock}</div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border-2 ${stockStatus.bg} ${stockStatus.text} ${stockStatus.border}`}>
                              {stockStatus.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{product.category || 'N/A'}</div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CotizadorLayout>
  )
}
