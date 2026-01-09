import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { FiEdit, FiTrash2, FiPlus, FiDownload, FiSearch } from 'react-icons/fi'
import Image from 'next/image'

export default function AdminProductos() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    stock: '',
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchProducts()
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

  const fetchProducts = async () => {
    try {
      const url = searchQuery
        ? `/api/productos?search=${encodeURIComponent(searchQuery)}`
        : '/api/productos'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchQuery])

  // Efecto para asegurar que los datos se carguen cuando se abre el modal o cambia el producto
  useEffect(() => {
    if (showModal && editingProduct) {
      const productData = {
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price != null ? String(editingProduct.price) : '',
        image: editingProduct.image || '',
        stock: editingProduct.stock != null ? String(editingProduct.stock) : '0',
      }
      console.log('🟢 useEffect - Cargando datos del producto:', productData)
      // Forzar actualización de formData
      setFormData(productData)
    } else if (showModal && !editingProduct) {
      // Limpiar formulario para nuevo producto
      setFormData({ name: '', description: '', price: '', image: '', stock: '' })
    }
  }, [showModal, editingProduct])

  const handleEdit = (product) => {
    console.log('🔵 handleEdit - Producto recibido:', product)
    // Preparar los datos del producto para el formulario
    const productData = {
      name: product.name || '',
      description: product.description || '',
      price: product.price != null ? String(product.price) : '',
      image: product.image || '',
      stock: product.stock != null ? String(product.stock) : '0',
    }
    console.log('🔵 handleEdit - Datos preparados:', productData)
    
    // CRÍTICO: Establecer los datos del formulario PRIMERO
    setFormData(productData)
    // Luego establecer el producto a editar
    setEditingProduct(product)
    console.log('🔵 handleEdit - Estados establecidos, abriendo modal...')
    // Abrir el modal - los datos ya están en formData
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchProducts()
      } else {
        alert('Error al eliminar producto')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar producto')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData({ ...formData, image: data.url })
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('Error al subir:', errorData)
        alert(`Error al subir la imagen: ${errorData.error || errorData.details || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert(`Error al subir la imagen: ${error.message || 'Error de conexión'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e, overrideData = null) => {
    e.preventDefault()
    try {
      const url = editingProduct
        ? `/api/productos/${editingProduct.id}`
        : '/api/productos'
      const method = editingProduct ? 'PUT' : 'POST'

      // Usar los datos proporcionados o formData como fallback
      const dataToSend = overrideData || formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dataToSend,
          price: parseFloat(dataToSend.price),
          stock: parseInt(dataToSend.stock) || 0,
        }),
      })

      if (res.ok) {
        const emptyData = { name: '', description: '', price: '', image: '', stock: '' }
        setFormData(emptyData)
        setEditingProduct(null)
        setShowModal(false)
        // Forzar actualización de la lista de productos
        await fetchProducts()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al guardar producto')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar producto')
    }
  }

  const handleExportExcel = async () => {
    try {
      const res = await fetch('/api/productos/export')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `productos-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Error al exportar productos')
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Head>
        <title>Productos - Panel Administrador</title>
      </Head>
      <AdminLayout user={user} onLogout={handleLogout}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
              <p className="text-gray-600 mt-1">
                {products.length} producto{products.length !== 1 ? 's' : ''} en total
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <FiDownload size={18} />
                <span>Exportar Excel</span>
              </button>
              <button
                onClick={() => {
                  const emptyData = { name: '', description: '', price: '', image: '', stock: '' }
                  setFormData(emptyData)
                  setEditingProduct(null)
                  setShowModal(true)
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FiPlus size={18} />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No hay productos disponibles
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-16 relative bg-gray-200 rounded-lg overflow-hidden">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                📦
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {product.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            S/. {product.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              product.stock > 10
                                ? 'bg-green-100 text-green-800'
                                : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.stock || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 size={18} />
                            </button>
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

        {/* Modal */}
        {showModal && (
          <ProductModal
            editingProduct={editingProduct}
            formData={formData}
            setFormData={setFormData}
            uploading={uploading}
            handleImageUpload={handleImageUpload}
            handleSubmit={handleSubmit}
            onClose={() => {
              setFormData({ name: '', description: '', price: '', image: '', stock: '' })
              setEditingProduct(null)
              setShowModal(false)
            }}
          />
        )}
      </AdminLayout>
    </>
  )
}

// Componente Modal separado para manejar el estado local
function ProductModal({ editingProduct, formData, setFormData, uploading, handleImageUpload, handleSubmit, onClose }) {
  // Calcular datos del formulario directamente desde editingProduct usando useMemo
  const computedFormData = useMemo(() => {
    if (editingProduct) {
      const data = {
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price != null ? String(editingProduct.price) : '',
        image: editingProduct.image || '',
        stock: editingProduct.stock != null ? String(editingProduct.stock) : '0',
      }
      console.log('🟡 ProductModal useMemo - Datos calculados:', data)
      return data
    }
    return { name: '', description: '', price: '', image: '', stock: '' }
  }, [editingProduct?.id, editingProduct?.name, editingProduct?.description, editingProduct?.price, editingProduct?.image, editingProduct?.stock])

  // Estado local para las ediciones del usuario
  const [localFormData, setLocalFormData] = useState(computedFormData)
  const [hasUserEdited, setHasUserEdited] = useState(false)

  // Sincronizar cuando cambia computedFormData (cuando cambia el producto)
  useEffect(() => {
    console.log('🟡 ProductModal useEffect - computedFormData:', computedFormData)
    console.log('🟡 ProductModal useEffect - Reseteando hasUserEdited y actualizando localFormData')
    setHasUserEdited(false)
    setLocalFormData(computedFormData)
  }, [computedFormData])

  // Sincronizar formData externo con localFormData para la imagen
  useEffect(() => {
    if (formData.image && formData.image !== localFormData.image) {
      setLocalFormData(prev => ({ ...prev, image: formData.image }))
    }
  }, [formData.image])

  const handleLocalImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (res.ok) {
        const data = await res.json()
        setLocalFormData(prev => ({ ...prev, image: data.url }))
        setFormData(prev => ({ ...prev, image: data.url }))
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('Error al subir:', errorData)
        alert(`Error al subir la imagen: ${errorData.error || errorData.details || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert(`Error al subir la imagen: ${error.message || 'Error de conexión'}`)
    }
  }

  const handleLocalSubmit = async (e) => {
    e.preventDefault()
    // Usar computedFormData si no hay ediciones del usuario, sino usar localFormData
    const dataToSubmit = hasUserEdited ? localFormData : computedFormData
    console.log('🟡 handleLocalSubmit - dataToSubmit:', dataToSubmit)
    // Actualizar formData externo antes de submit
    setFormData(dataToSubmit)
    // Pasar los datos directamente al handleSubmit para evitar problemas de sincronización
    await handleSubmit(e, dataToSubmit)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900">
            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          {editingProduct && (
            <p className="text-sm text-gray-500 mt-1">
              Editando: <span className="font-semibold">{editingProduct.name}</span>
            </p>
          )}
        </div>
        {(() => {
          console.log('🟡 RENDER FORM - localFormData:', localFormData)
          console.log('🟡 RENDER FORM - computedFormData:', computedFormData)
          console.log('🟡 RENDER FORM - editingProduct:', editingProduct)
          return null
        })()}
        <form 
          onSubmit={handleLocalSubmit} 
          className="space-y-4"
        >
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={hasUserEdited ? localFormData?.name ?? '' : computedFormData?.name ?? ''}
                    onChange={(e) => {
                      console.log('🟡 onChange name - nuevo valor:', e.target.value)
                      setHasUserEdited(true)
                      setLocalFormData({ ...localFormData, name: e.target.value })
                    }}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={hasUserEdited ? localFormData?.description ?? '' : computedFormData?.description ?? ''}
                    onChange={(e) => {
                      setHasUserEdited(true)
                      setLocalFormData({ ...localFormData, description: e.target.value })
                    }}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700 mb-2">
                      Precio *
                    </label>
                    <input
                      id="edit-price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={hasUserEdited ? localFormData?.price ?? '' : computedFormData?.price ?? ''}
                      onChange={(e) => {
                        setHasUserEdited(true)
                        setLocalFormData({ ...localFormData, price: e.target.value })
                      }}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-stock" className="block text-sm font-medium text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      id="edit-stock"
                      name="stock"
                      type="number"
                      value={hasUserEdited ? localFormData?.stock ?? '' : computedFormData?.stock ?? ''}
                      onChange={(e) => {
                        setHasUserEdited(true)
                        setLocalFormData({ ...localFormData, stock: e.target.value })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del Producto
                  </label>
                  <div className="space-y-3">
                    {/* Vista previa de la imagen actual */}
                    {localFormData.image && (
                      <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Vista Previa:</p>
                        <div className="flex items-start gap-3">
                          <img
                            src={localFormData.image}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 break-all mb-2">
                              {localFormData.image.startsWith('/uploads/') 
                                ? 'Imagen local' 
                                : 'Imagen del producto'}
                            </p>
                            <button
                              type="button"
                              onClick={() => setLocalFormData({ ...localFormData, image: '' })}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold"
                            >
                              ✕ Eliminar imagen
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subir archivo */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Subir imagen desde tu computadora
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalImageUpload}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-blue-400 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-semibold"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
  )
}
