import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { FiEye } from 'react-icons/fi'
import ProductModal from './ProductModal'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = () => {
    addToCart(product)
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        {/* Imagen del producto */}
        <div className="relative w-full h-48 bg-gray-100 group overflow-hidden">
          {product.image && !imageError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
              onError={(e) => {
                console.error('Error cargando imagen:', product.image, e)
                setImageError(true)
              }}
              onLoad={() => {
                console.log('Imagen cargada exitosamente:', product.image)
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              <div className="text-center">
                <div className="text-4xl mb-2">📦</div>
                <div className="text-xs">Sin imagen</div>
              </div>
            </div>
          )}
          {/* Botón de vista rápida */}
          <button
            onClick={() => setShowModal(true)}
            className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
            title="Vista rápida"
          >
            <FiEye size={20} />
          </button>
        </div>

        {/* Información del producto */}
        <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        {isAuthenticated && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-2xl font-bold text-green-600">
              S/. {product.price.toFixed(2)}
            </p>
            <button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              Agregar
            </button>
          </div>
        )}
          {product.stock !== undefined && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Stock disponible:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    product.stock > 20
                      ? 'bg-green-100 text-green-800'
                      : product.stock > 10
                      ? 'bg-yellow-100 text-yellow-800'
                      : product.stock > 0
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.stock > 0 ? (
                    <>
                      <span className="w-2 h-2 rounded-full mr-1.5 bg-current"></span>
                      {product.stock} unidades
                    </>
                  ) : (
                    'Agotado'
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del producto */}
      {showModal && (
        <ProductModal
          product={product}
          onClose={() => setShowModal(false)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  )
}

