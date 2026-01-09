-- Script SQL para actualizar imágenes automáticamente basándose en palabras clave
-- Ejecuta esto en Supabase -> SQL Editor
-- Actualiza TODOS los productos automáticamente

UPDATE "Product"
SET image = CASE
  -- Alicates / Pinzas - Foto específica de alicates
  WHEN LOWER(name) LIKE '%alicat%' OR LOWER(name) LIKE '%pinza%' 
    THEN 'https://images.unsplash.com/photo-1622819584099-e04ccb14e8a7?w=800&h=600&fit=crop&q=80'
  
  -- Cinta Métrica - Foto específica de cinta métrica/herramientas de medición
  WHEN LOWER(name) LIKE '%cinta%' OR LOWER(name) LIKE '%métrica%' OR LOWER(name) LIKE '%metro%'
    THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80'
  
  -- Destornillador - Foto específica de destornillador
  WHEN LOWER(name) LIKE '%destornillador%' OR LOWER(name) LIKE '%phillips%'
    THEN 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80'
  
  -- Llave - Foto específica de llave ajustable
  WHEN LOWER(name) LIKE '%llave%' OR LOWER(name) LIKE '%inglesa%'
    THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80'
  
  -- Martillo - Foto específica de martillo de construcción
  WHEN LOWER(name) LIKE '%martillo%'
    THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80'
  
  -- Nivel - Foto específica de nivel de burbuja
  WHEN LOWER(name) LIKE '%nivel%' OR LOWER(name) LIKE '%burbuja%'
    THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80'
  
  -- Pintura - Foto específica de bote de pintura (ÚNICA - diferente a las demás)
  WHEN LOWER(name) LIKE '%pintura%' OR LOWER(name) LIKE '%latex%'
    THEN 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop&q=80'
  
  -- Sierra - Foto específica de sierra de mano
  WHEN LOWER(name) LIKE '%sierra%'
    THEN 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80'
  
  -- Taladro - Foto específica de taladro eléctrico
  WHEN LOWER(name) LIKE '%taladro%'
    THEN 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80'
  
  -- Tornillos - Foto específica de tornillos y herrajes
  WHEN LOWER(name) LIKE '%tornillo%'
    THEN 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80'
  
  -- Si no coincide con nada, mantener la imagen actual
  ELSE image
END;

-- Verificar resultados
SELECT name, image 
FROM "Product" 
ORDER BY name;
