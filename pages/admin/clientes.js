import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { FiUser, FiMail, FiCalendar, FiFileText, FiSearch, FiChevronDown, FiChevronUp, FiPhone, FiEdit2, FiSave, FiX } from 'react-icons/fi'

export default function AdminClientes() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCustomer, setExpandedCustomer] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [editFormData, setEditFormData] = useState({ email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchCustomers()
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

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/clientes')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completada'
      case 'sent':
        return 'Enviada'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer.id)
    setEditFormData({
      email: customer.email || '',
      phone: customer.phone || '',
    })
  }

  const handleCancelEdit = () => {
    setEditingCustomer(null)
    setEditFormData({ email: '', phone: '' })
  }

  const handleSaveEdit = async (customerId) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/clientes/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })

      if (res.ok) {
        // Actualizar la lista de clientes
        await fetchCustomers()
        setEditingCustomer(null)
        setEditFormData({ email: '', phone: '' })
      } else {
        const data = await res.json()
        alert(data.error || 'Error al actualizar cliente')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('Error al actualizar cliente')
    } finally {
      setSaving(false)
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phone && customer.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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

  return (
    <>
      <Head>
        <title>Clientes - Panel Administrador</title>
      </Head>
      <AdminLayout user={user} onLogout={handleLogout}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
              <p className="text-gray-600 mt-1">
                {customers.length} cliente{customers.length !== 1 ? 's' : ''} registrado{customers.length !== 1 ? 's' : ''}
              </p>
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
                placeholder="Buscar clientes por nombre, email o teléfono..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Tabla de Clientes */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FiUser size={16} />
                        Cliente
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FiMail size={16} />
                        Contacto
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={16} />
                        Fecha Registro
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-2">
                        <FiFileText size={16} />
                        Cotizaciones
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                      Total Gastado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        {searchQuery ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer, index) => (
                      <>
                        <tr key={customer.id} className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } border-b-2 border-gray-200`}>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md ring-2 ring-blue-200">
                                <span className="text-white font-bold text-lg">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                                <div className="text-xs text-gray-500 font-mono">ID: {customer.id.slice(0, 8)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            {editingCustomer === customer.id ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FiMail size={14} className="text-gray-400" />
                                  <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                    placeholder="Email"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <FiPhone size={14} className="text-gray-400" />
                                  <input
                                    type="tel"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                    placeholder="Teléfono"
                                  />
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() => handleSaveEdit(customer.id)}
                                    disabled={saving}
                                    className="text-green-600 hover:text-green-800 flex items-center gap-1 text-xs"
                                  >
                                    <FiSave size={14} />
                                    Guardar
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-xs"
                                  >
                                    <FiX size={14} />
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-sm text-gray-900 flex items-center gap-2">
                                  <FiMail size={14} className="text-gray-400" />
                                  {customer.email}
                                </div>
                                {customer.phone && (
                                  <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <FiPhone size={14} className="text-gray-400" />
                                    {customer.phone}
                                  </div>
                                )}
                                {!customer.phone && (
                                  <div className="text-xs text-gray-400 italic">
                                    Sin teléfono registrado
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <FiCalendar size={14} className="text-gray-400" />
                              {formatDate(customer.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-full shadow-sm ${
                              customer.totalQuotes > 0
                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}>
                              <FiFileText size={14} className="mr-1.5" />
                              {customer.totalQuotes}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right">
                            <div className={`text-base font-bold ${
                              customer.totalSpent > 0
                                ? 'text-green-600'
                                : 'text-gray-500'
                            }`}>
                              {formatCurrency(customer.totalSpent)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              {editingCustomer !== customer.id && (
                                <button
                                  onClick={() => handleEdit(customer)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Editar contacto"
                                >
                                  <FiEdit2 size={18} />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)
                                }
                                className="px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1.5 font-medium"
                              >
                                {expandedCustomer === customer.id ? (
                                  <>
                                    <FiChevronUp size={18} />
                                    <span className="text-sm">Ocultar</span>
                                  </>
                                ) : (
                                  <>
                                    <FiChevronDown size={18} />
                                    <span className="text-sm">Ver más</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedCustomer === customer.id && customer.quotes.length > 0 && (
                          <tr>
                            <td colSpan="6" className="px-6 py-5 bg-gradient-to-br from-blue-50 to-gray-50">
                              <div className="space-y-4">
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <div className="p-2 bg-blue-600 rounded-lg">
                                    <FiFileText size={18} className="text-white" />
                                  </div>
                                  <span>Historial de Cotizaciones</span>
                                  <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                    {customer.quotes.length}
                                  </span>
                                </h3>
                                <div className="grid gap-3">
                                  {customer.quotes.map((quote) => (
                                    <div
                                      key={quote.id}
                                      className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg transition-all flex items-center justify-between"
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <span className="px-3 py-1 text-xs font-mono font-bold bg-gray-100 text-gray-700 rounded-lg border border-gray-300">
                                            #{quote.id.slice(0, 8).toUpperCase()}
                                          </span>
                                          <span
                                            className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${getStatusColor(
                                              quote.status
                                            )}`}
                                          >
                                            {getStatusLabel(quote.status)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <FiCalendar size={14} className="text-gray-400" />
                                          <span>Fecha: {formatDate(quote.createdAt)}</span>
                                        </div>
                                      </div>
                                      <div className="text-right flex items-center gap-4">
                                        <div>
                                          <div className="text-xl font-bold text-green-600">
                                            {formatCurrency(quote.total)}
                                          </div>
                                        </div>
                                        <a
                                          href={`/api/cotizaciones/${quote.id}/pdf`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                                        >
                                          Ver PDF
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                        {expandedCustomer === customer.id && customer.quotes.length === 0 && (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 bg-gradient-to-br from-gray-50 to-blue-50">
                              <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-3">
                                  <FiFileText size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-600 font-medium">
                                  Este cliente aún no ha realizado cotizaciones
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}

