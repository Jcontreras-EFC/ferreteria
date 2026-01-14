import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'

// Función para buscar imagen de producto automáticamente
async function searchProductImage(productName) {
  try {
    // Limpiar el nombre del producto para la búsqueda
    const cleanName = productName
      .replace(/[#\d"]/g, '') // Remover números y símbolos
      .trim()
      .split(' ')
      .slice(0, 3) // Tomar las primeras 3 palabras
      .join(' ')
    
    if (!cleanName || cleanName.length < 2) {
      return null
    }
    
    // Usar Picsum Photos (más confiable que Unsplash Source)
    // Genera imágenes placeholder de alta calidad
    const imageId = Math.floor(Math.random() * 1000) + 1
    const picsumUrl = `https://picsum.photos/400/400?random=${imageId}`
    
    // Verificar que la URL sea accesible
    try {
      const testResponse = await fetch(picsumUrl, { 
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      if (testResponse.ok) {
        return picsumUrl
      }
    } catch (fetchError) {
      console.log('Error verificando Picsum:', fetchError.message)
    }
    
    // Fallback: usar un placeholder con el nombre del producto
    const placeholderUrl = `https://via.placeholder.com/400x400/22c55e/ffffff?text=${encodeURIComponent(cleanName.substring(0, 20))}`
    
    return placeholderUrl
  } catch (error) {
    console.error('Error searching image:', error)
    // Retornar un placeholder genérico si todo falla
    return `https://via.placeholder.com/400x400/22c55e/ffffff?text=Producto`
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    // Verificar autenticación - Solo administradores
    const user = await getCurrentUser(req)
    if (!user) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    // Solo admin y superadmin pueden actualizar imágenes
    const adminRoles = ['admin', 'superadmin']
    if (!adminRoles.includes(user.role?.toLowerCase())) {
      return res.status(403).json({ error: 'Solo administradores pueden actualizar imágenes' })
    }

    // Obtener todos los productos sin imagen
    const productsWithoutImage = await prisma.product.findMany({
      where: {
        OR: [
          { image: null },
          { image: '' }
        ]
      }
    })

    if (productsWithoutImage.length === 0) {
      return res.json({ 
        success: true, 
        message: 'Todos los productos ya tienen imagen',
        updated: 0,
        total: 0
      })
    }

    let updated = 0
    let errors = 0

    // Actualizar cada producto sin imagen
    for (const product of productsWithoutImage) {
      try {
        const imageUrl = await searchProductImage(product.name)
        
        // Si la búsqueda falla, usar un placeholder con el nombre del producto
        const finalImage = imageUrl || (() => {
          const cleanName = product.name.trim().substring(0, 20).replace(/[^a-zA-Z0-9\s]/g, '')
          return `https://via.placeholder.com/400x400/22c55e/ffffff?text=${encodeURIComponent(cleanName || 'Producto')}`
        })()

        await prisma.product.update({
          where: { id: product.id },
          data: { image: finalImage }
        })

        updated++
      } catch (error) {
        console.error(`Error actualizando imagen para "${product.name}":`, error)
        errors++
      }
    }

    return res.json({
      success: true,
      message: `Imágenes actualizadas: ${updated} productos. ${errors > 0 ? `${errors} errores.` : ''}`,
      updated,
      errors,
      total: productsWithoutImage.length
    })
  } catch (error) {
    console.error('Error en actualizar-imagenes:', error)
    return res.status(500).json({ error: 'Error al actualizar imágenes' })
  }
}
