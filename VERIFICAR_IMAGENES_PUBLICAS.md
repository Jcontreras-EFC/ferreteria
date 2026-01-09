# Verificar que las imágenes sean públicas

## Pasos para verificar en Supabase:

1. Ve a Supabase Dashboard → Storage
2. Selecciona el bucket `products-images`
3. Ve a la pestaña "Policies"
4. Asegúrate de que existan estas políticas:

### Política 1: Permitir lectura pública
- **Name**: Allow public read
- **Allowed operation**: SELECT
- **Policy definition**: `bucket_id = 'products-images'`

### Política 2: Permitir subida (opcional, solo para admin)
- **Name**: Allow authenticated upload
- **Allowed operation**: INSERT
- **Policy definition**: `bucket_id = 'products-images' AND auth.role() = 'authenticated'`

## Verificar que una imagen sea pública:

1. Copia una URL de imagen de un producto
2. Ábrela en una ventana de incógnito (sin estar logueado)
3. Si se ve la imagen, está configurada correctamente ✅
4. Si da error 403, necesitas configurar las políticas ❌
