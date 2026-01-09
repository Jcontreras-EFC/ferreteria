import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { FiPackage, FiFileText, FiUsers, FiDollarSign } from 'react-icons/fi'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    checkAuth()
    fetchStats()
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
          // Si no es admin, redirigir a la página principal
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

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
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

  return (
    <>
      <Head>
        <title>Dashboard - Panel Administrador</title>
      </Head>
      <AdminLayout user={user} onLogout={handleLogout}>
        <div className="space-y-6">
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Productos"
              value={stats?.totalProducts || 0}
              icon={FiPackage}
              color="blue"
            />
            <MetricCard
              title="Cotizaciones"
              value={stats?.totalQuotes || 0}
              icon={FiFileText}
              color="green"
            />
            <MetricCard
              title="Administradores"
              value={stats?.totalUsers || 0}
              icon={FiUsers}
              color="purple"
            />
            <MetricCard
              title="Ingresos Totales"
              value={`S/. ${(stats?.totalRevenue || 0).toLocaleString('es-MX', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={FiDollarSign}
              color="yellow"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Cotizaciones por Mes */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Cotizaciones por Mes
                </h3>
                <p className="text-sm text-gray-500">Evolución mensual de cotizaciones</p>
              </div>
              {stats?.monthlyData ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={stats.monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      stroke="#9CA3AF"
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      stroke="#9CA3AF"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      name="Cotizaciones"
                      dot={{ fill: '#3B82F6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-320 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg">No hay datos disponibles</p>
                    <p className="text-sm mt-1">Las cotizaciones aparecerán aquí</p>
                  </div>
                </div>
              )}
            </div>

            {/* Gráfico de Cotizaciones por Estado */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Cotizaciones por Estado
                </h3>
                <p className="text-sm text-gray-500">Distribución de estados de cotizaciones</p>
              </div>
              {stats?.quotesByStatus ? (
                (() => {
                  const pieData = [
                    { name: 'Pendientes', value: stats.quotesByStatus.pending || 0, color: '#F59E0B' },
                    { name: 'Enviadas', value: stats.quotesByStatus.sent || 0, color: '#3B82F6' },
                    { name: 'Completadas', value: stats.quotesByStatus.completed || 0, color: '#10B981' },
                  ].filter(item => item.value > 0) // Solo mostrar categorías con valores > 0
                  
                  const total = pieData.reduce((sum, item) => sum + item.value, 0)
                  
                  return pieData.length > 0 ? (
                    <div>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) =>
                              `${name}\n${value} (${(percent * 100).toFixed(0)}%)`
                            }
                            outerRadius={100}
                            innerRadius={40}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value, name) => [`${value} cotizaciones`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 flex flex-wrap justify-center gap-4">
                        {pieData.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="text-sm text-gray-700 font-medium">
                              {entry.name}: <span className="font-bold">{entry.value}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-320 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-lg">No hay cotizaciones registradas</p>
                        <p className="text-sm mt-1">Las cotizaciones aparecerán aquí</p>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div className="h-320 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg">No hay datos disponibles</p>
                    <p className="text-sm mt-1">Cargando información...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Productos Más Cotizados */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Productos Más Cotizados
              </h3>
              <p className="text-sm text-gray-500">Top 5 productos más solicitados en cotizaciones</p>
            </div>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              (() => {
                // Función para formatear números grandes
                const formatNumber = (num) => {
                  if (num >= 1000000) {
                    return (num / 1000000).toFixed(1) + 'M'
                  } else if (num >= 1000) {
                    return (num / 1000).toFixed(1) + 'K'
                  }
                  return num.toString()
                }

                // Función para formatear números completos en tooltips y etiquetas
                const formatFullNumber = (num) => {
                  return num.toLocaleString('es-MX')
                }

                // Función para truncar nombres largos
                const truncateName = (name, maxLength = 20) => {
                  if (name.length <= maxLength) return name
                  return name.substring(0, maxLength - 3) + '...'
                }

                // Preparar datos con nombres truncados para el eje X
                const chartData = stats.topProducts.map(product => ({
                  ...product,
                  displayName: truncateName(product.name, 25)
                }))

                const maxValue = Math.max(...stats.topProducts.map(p => p.quoteCount))
                const yAxisMax = maxValue > 10 
                  ? Math.ceil(maxValue * 1.1) // Si hay valores grandes, agregar 10% más
                  : Math.max(5, maxValue + 1) // Si son valores pequeños, mínimo 5
                
                return (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={chartData} 
                      margin={{ top: 30, right: 30, left: 60, bottom: 120 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                      <XAxis
                        dataKey="displayName"
                        angle={-45}
                        textAnchor="end"
                        height={140}
                        tick={{ fontSize: 10, fill: '#6B7280' }}
                        stroke="#9CA3AF"
                        interval={0}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        stroke="#9CA3AF"
                        label={{ value: 'Veces cotizado', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: '12px' } }}
                        allowDecimals={false}
                        domain={[0, yAxisMax]}
                        tickFormatter={formatNumber}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          padding: '12px',
                          maxWidth: '300px'
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '8px', wordBreak: 'break-word' }}
                        labelFormatter={(label) => {
                          // Buscar el nombre completo del producto
                          const product = stats.topProducts.find(p => truncateName(p.name, 25) === label)
                          return product ? product.name : label
                        }}
                        formatter={(value) => [`${formatFullNumber(Math.round(value))} ${Math.round(value) === 1 ? 'vez' : 'veces'}`, 'Cotizado']}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      />
                      <Bar 
                        dataKey="quoteCount" 
                        name="Veces cotizado"
                        radius={[8, 8, 0, 0]}
                        label={{ 
                          position: 'top', 
                          fill: '#374151', 
                          fontSize: 12, 
                          fontWeight: 'bold',
                          formatter: (value) => formatFullNumber(value)
                        }}
                      >
                        {stats.topProducts.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()
            ) : (
              <div className="h-400 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg">No hay productos cotizados aún</p>
                  <p className="text-sm mt-1">Los productos más cotizados aparecerán aquí</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  )
}

function MetricCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
    green: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white',
  }

  const bgGradientClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100',
    green: 'bg-gradient-to-br from-green-50 to-green-100',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
  }

  return (
    <div className={`${bgGradientClasses[color]} rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-md ${colorClasses[color]}`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  )
}
