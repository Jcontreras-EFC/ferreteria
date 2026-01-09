import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FiX } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

export default function ProductModal({ product, onClose, onAddToCart }) {
  const { isAuthenticated } = useAuth()
  const [imageError, setImageError] = useState(false)
  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 text-gray-800 p-2 rounded-full shadow-lg transition-colors"
          title="Cerrar"
        >
          <FiX size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Imagen del producto */}
          <div className="relative w-full aspect-square md:aspect-auto md:h-96 bg-gray-100 rounded-lg overflow-hidden">
            {product.image && !imageError ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain md:object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                <div className="text-center">
                  <div className="text-6xl mb-2">📦</div>
                  <div className="text-sm">Sin imagen</div>
                </div>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>
              {product.description && (
                <p className="text-gray-600 text-base leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Código del producto */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-1">Código</p>
              <p className="text-gray-900 font-medium">
                {product.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Precio */}
            {isAuthenticated && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-1">Precio</p>
                <p className="text-3xl font-bold text-green-600">
                  S/. {product.price.toFixed(2)}
                </p>
              </div>
            )}

            {/* Stock */}
            {product.stock !== undefined && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Stock disponible</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-base font-bold ${
                      product.stock > 20
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : product.stock > 10
                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                        : product.stock > 0
                        ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                        : 'bg-red-100 text-red-800 border-2 border-red-300'
                    }`}
                  >
                    {product.stock > 0 ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full mr-2 bg-current animate-pulse"></span>
                        {product.stock} unidades
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full mr-2 bg-current"></span>
                        Agotado
                      </>
                    )}
                  </span>
                  {product.stock > 0 && product.stock <= 10 && (
                    <span className="text-xs text-orange-600 font-medium">
                      ⚠️ Últimas unidades
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              {isAuthenticated && (
                <button
                  onClick={() => {
                    onAddToCart()
                    onClose()
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-lg"
                >
                  Agregar al Carrito
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

