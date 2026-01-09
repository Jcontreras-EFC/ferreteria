import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
// En el servidor (API routes), las variables NEXT_PUBLIC_* pueden no estar disponibles
// Por eso usamos también las versiones sin NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase URL o Key no configurados. Las imágenes no funcionarán hasta configurarlos.')
  console.warn('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing')
  console.warn('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'present' : 'missing')
  console.warn('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing')
  console.warn('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'present' : 'missing')
}

// Crear cliente de Supabase
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Bucket para imágenes de productos
export const PRODUCTS_BUCKET = 'products-images'
