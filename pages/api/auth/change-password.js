import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' })
    }

    // Obtener usuario completo con contraseña
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, fullUser.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' })
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return res.status(200).json({ message: 'Contraseña actualizada exitosamente' })
  } catch (error) {
    console.error('Error changing password:', error)
    return res.status(500).json({ error: 'Error al cambiar contraseña' })
  }
}

