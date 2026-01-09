import { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MisCotizaciones() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/mis-cotizaciones')
        if (res.ok) {
          const data = await res.json()
          setQuotes(data)
        } else if (res.status === 401) {
          setError('Debes iniciar sesión para ver tu historial de cotizaciones.')
        } else {
          setError('No se pudieron cargar tus cotizaciones.')
        }
      } catch (err) {
        console.error('Error fetching user quotes:', err)
        setError('No se pudieron cargar tus cotizaciones.')
      } finally {
        setLoading(false)
      }
    }

    fetchQuotes()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount || 0)

  return (
    <>
      <Head>
        <title>Mis Cotizaciones - Ferretería</title>
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-20 pb-8 bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 text-center">Mis Cotizaciones</h1>
            <p className="text-gray-600 mb-6 text-center">
              Aquí puedes ver el historial de cotizaciones que has enviado desde tu cuenta.
            </p>

            {loading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando tus cotizaciones...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : quotes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-2">Aún no tienes cotizaciones registradas.</p>
                <a
                  href="/productos"
                  className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Ver Productos
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <tr>
                        <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border-b-2 border-blue-800">
                          N° Cotización
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border-b-2 border-blue-800">
                          Fecha
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border-b-2 border-blue-800">
                          Total
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider border-b-2 border-blue-800">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {quotes.map((quote, index) => (
                        <tr 
                          key={quote.id} 
                          className={`hover:bg-blue-50 transition-colors ${
                            index !== quotes.length - 1 ? 'border-b-2 border-gray-200' : ''
                          }`}
                        >
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 font-mono text-center">
                            #{quote.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 text-center">
                            {formatDate(quote.createdAt)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-gray-900 text-center">
                            {formatCurrency(quote.total)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center">
                            <a
                              href={`/api/cotizaciones/${quote.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
                            >
                              Ver PDF
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}






