import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const router = useRouter()
  const { getItemCount } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const isAdmin = user && ['admin', 'superadmin', 'editor', 'viewer'].includes(user.role)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 shadow-lg z-50 border-b border-green-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full border-2 border-green-500">
              <span className="text-green-500 font-bold text-xl">GRC</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-lg">Corporación GRC</div>
              <div className="text-green-400 text-xs">ISO 9001:2015</div>
            </div>
          </Link>

          {/* Buscador Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-r-lg transition-colors"
            >
              🔍
            </button>
          </form>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="hover:text-green-400 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/productos"
              className="hover:text-green-400 transition-colors"
            >
              Productos
            </Link>
            <Link
              href="/carrito"
              className="relative hover:text-blue-400 transition-colors"
            >
              🛒 Carrito
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                {user && (
                  <Link
                    href="/mis-cotizaciones"
                    className="hover:text-blue-400 transition-colors text-sm"
                  >
                    Mis Cotizaciones
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Inicio de Sesión
              </Link>
            )}
          </nav>

          {/* Botón Menú Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Menú Mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
            <form onSubmit={handleSearch} className="mt-4 flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg"
              >
                🔍
              </button>
            </form>
            <nav className="mt-4 flex flex-col space-y-2">
              <Link
                href="/"
                className="py-2 hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/productos"
                className="py-2 hover:text-blue-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Productos
              </Link>
              <Link
                href="/carrito"
                className="py-2 hover:text-blue-400 transition-colors relative"
                onClick={() => setIsMenuOpen(false)}
              >
                🛒 Carrito
                {getItemCount() > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {getItemCount()}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <>
                  {user && (
                    <Link
                      href="/mis-cotizaciones"
                      className="py-2 hover:text-blue-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mis Cotizaciones
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="py-2 hover:text-blue-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="py-2 hover:text-blue-400 transition-colors text-left w-full"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="py-2 hover:text-blue-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio de Sesión
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

