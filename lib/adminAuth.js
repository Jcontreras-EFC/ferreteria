/**
 * Helper para verificar autenticación de administradores
 * Usa esta función en todas las páginas de admin
 */
export async function checkAdminAuth() {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    
    if (!res.ok) {
      return { user: null, error: 'Not authenticated' }
    }
    
    const userData = await res.json()
    
    // Verificar que el usuario tenga un rol de administrador
    const adminRoles = ['admin', 'superadmin', 'editor', 'viewer']
    if (!adminRoles.includes(userData.role)) {
      return { user: null, error: 'Not authorized' }
    }
    
    return { user: userData, error: null }
  } catch (error) {
    console.error('Auth error:', error)
    return { user: null, error: 'Auth check failed' }
  }
}
