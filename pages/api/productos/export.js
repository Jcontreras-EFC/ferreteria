import { prisma } from '../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'
import * as XLSX from 'xlsx'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await getCurrentUser(req)
    if (!user) {
      return res.status(401).json({ error: 'No autorizado' })
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Preparar datos para Excel
    const excelData = products.map((product) => ({
      ID: product.id,
      Nombre: product.name,
      Descripción: product.description || '',
      Precio: product.price,
      Stock: product.stock || 0,
      Categoría: product.category || '',
      Imagen: product.image || '',
      'Fecha Creación': new Date(product.createdAt).toLocaleDateString(),
    }))

    // Crear workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 30 }, // ID
      { wch: 30 }, // Nombre
      { wch: 50 }, // Descripción
      { wch: 15 }, // Precio
      { wch: 10 }, // Stock
      { wch: 20 }, // Categoría
      { wch: 40 }, // Imagen
      { wch: 20 }, // Fecha
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Productos')

    // Generar buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=productos-${new Date().toISOString().split('T')[0]}.xlsx`
    )

    return res.send(buffer)
  } catch (error) {
    console.error('Error exporting products:', error)
    return res.status(500).json({ error: 'Error al exportar productos' })
  }
}

