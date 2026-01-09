import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    // Solo administradores pueden editar clientes
    const adminRoles = ['admin', 'superadmin', 'editor']
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para editar clientes' })
    }

    const { id } = req.query
    const { email, phone } = req.body

    // Validar que el cliente existe y es un cliente (no admin)
    const customer = await prisma.user.findUnique({
      where: { id },
    })

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' })
    }

    if (customer.role !== 'customer') {
      return res.status(403).json({ error: 'Solo se pueden editar clientes' })
    }

    // Validar email si se proporciona
    if (email) {
      // Verificar que el email no esté en uso por otro usuario
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      })

      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está en uso por otro usuario' })
      }
    }

    // Actualizar el cliente
    const updatedCustomer = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return res.status(200).json(updatedCustomer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return res.status(500).json({ error: 'Error al actualizar cliente' })
  }
}










