import { useState, useEffect } from 'react'
import Head from 'next/head'
import { FiPackage, FiSearch, FiAlertCircle, FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi'
import { checkCotizadorAuth } from '../../lib/cotizadorAuth'
import CotizadorLayout from '../../components/cotizador/CotizadorLayout'

export default function CotizadorProductos() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // all, low, medium, high, out

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

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiPackage size={28} />
              Inventario de Productos
            </h1>
            <p className="text-green-100 text-sm mt-1">Consulta el stock disponible de todos los productos</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FiPackage className="text-gray-400" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sin Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <FiXCircle className="text-red-400" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
              <FiAlertCircle className="text-orange-400" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Medio</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.mediumStock}</p>
              </div>
              <FiAlertCircle className="text-yellow-400" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Alto</p>
                <p className="text-2xl font-bold text-green-600">{stats.highStock}</p>
              </div>
              <FiCheckCircle className="text-green-400" size={24} />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FiSearch className="inline mr-2" size={16} />
                Búsqueda
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 shadow-sm transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FiFilter className="inline mr-2" size={16} />
                Filtro por Stock
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white shadow-sm transition-all"
              >
                <option value="all">Todos</option>
                <option value="out">Sin Stock</option>
                <option value="low">Stock Bajo (&lt;10)</option>
                <option value="medium">Stock Medio (10-49)</option>
                <option value="high">Stock Alto (≥50)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Productos ({filteredProducts.length})
              </h2>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <FiPackage className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">No se encontraron productos</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stock = product.stock || 0
                const stockStatus = getStockStatus(stock)
                
                return (
                  <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.png'
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-3">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Precio:</span>{' '}
                                <span className="text-green-600 font-bold">S/. {product.price?.toFixed(2) || '0.00'}</span>
                              </div>
                              {product.category && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Categoría:</span> {product.category}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className={`inline-flex items-center px-4 py-2 rounded-lg border-2 ${stockStatus.bg} ${stockStatus.text} ${stockStatus.border}`}>
                          <span className="font-bold text-lg mr-2">{stock}</span>
                          <span className="text-sm font-semibold">{stockStatus.label}</span>
                        </div>
                        {stock === 0 && (
                          <div className="mt-2 flex items-center justify-end text-red-600 text-xs">
                            <FiAlertCircle size={14} className="mr-1" />
                            Requiere reposición
                          </div>
                        )}
                        {stock > 0 && stock < 10 && (
                          <div className="mt-2 flex items-center justify-end text-orange-600 text-xs">
                            <FiAlertCircle size={14} className="mr-1" />
                            Stock crítico
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
      </div>
    </CotizadorLayout>
  )
}
