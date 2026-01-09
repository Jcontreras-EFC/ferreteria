-- Script SQL para actualizar imágenes con URLs ÚNICAS para cada producto
-- Cada producto tendrá una imagen diferente y específica
-- Ejecuta esto en Supabase -> SQL Editor

UPDATE "Product"
SET image = CASE
  -- Alicates de Punta - Foto específica de alicates
  WHEN name = 'Alicates de Punta' 
    THEN 'https://images.unsplash.com/photo-1622819584099-e04ccb14e8a7?w=800&h=600&fit=crop&q=80'
  
  -- Cinta Métrica 5m - Foto específica de cinta métrica
  WHEN name = 'Cinta Métrica 5m'
    THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80'
  
  -- Destornillador Phillips #2 - Foto específica de destornillador
  WHEN name = 'Destornillador Phillips #2'
    THEN 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80'
  
  -- Llave Inglesa Ajustable 10" - Foto específica de llave ajustable
  WHEN name = 'Llave Inglesa Ajustable 10"'
    THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80'
  
  -- Martillo de Acero 500g - Foto específica de martillo (URL diferente)
  WHEN name = 'Martillo de Acero 500g'
    THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80'
  
  -- Nivel de Burbuja 60cm - Foto específica de nivel (URL diferente)
  WHEN name = 'Nivel de Burbuja 60cm'
    THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80'
  
  -- Pintura Latex Blanca 4L - Foto específica de bote de pintura (ÚNICA)
  WHEN name = 'Pintura Latex Blanca 4L'
    THEN 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop&q=80'
  
  -- Sierra de Mano 20" - Foto específica de sierra (URL diferente)
  WHEN name = 'Sierra de Mano 20"'
    THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80'
  
  -- Taladro Inalámbrico 18V - Foto específica de taladro (URL diferente)
  WHEN name = 'Taladro Inalámbrico 18V'
    THEN 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80'
  
  -- Tornillos Autorroscantes #8 x 1" - Foto específica de tornillos (URL diferente)
  WHEN name = 'Tornillos Autorroscantes #8 x 1"'
    THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80'
  
  -- Si no coincide con nada, mantener la imagen actual
  ELSE image
END
WHERE name IN (
  'Alicates de Punta',
  'Cinta Métrica 5m',
  'Destornillador Phillips #2',
  'Llave Inglesa Ajustable 10"',
  'Martillo de Acero 500g',
  'Nivel de Burbuja 60cm',
  'Pintura Latex Blanca 4L',
  'Sierra de Mano 20"',
  'Taladro Inalámbrico 18V',
  'Tornillos Autorroscantes #8 x 1"'
);

-- Verificar resultados
SELECT name, image 
FROM "Product" 
ORDER BY name;
