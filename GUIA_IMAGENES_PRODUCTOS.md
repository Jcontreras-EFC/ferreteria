# 📸 Guía: Cómo Subir Imágenes de Productos

## 🎯 Métodos Disponibles

### 1. **Subir Imagen desde Archivo (Recomendado)**
Este es el método más seguro y recomendado. Las imágenes se suben a Supabase Storage.

**Pasos:**
1. Ve al panel de administración → Productos
2. Haz clic en "Nuevo" o edita un producto existente
3. En el campo "Imagen", haz clic en "Seleccionar archivo"
4. Elige una imagen desde tu computadora (JPG, PNG, GIF - máximo 5MB)
5. La imagen se subirá automáticamente a Supabase Storage
6. Guarda el producto

**Ventajas:**
- ✅ Imágenes almacenadas de forma segura en Supabase
- ✅ URLs permanentes y confiables
- ✅ Optimización automática
- ✅ No depende de servicios externos

---

### 2. **Usar URL de Imagen Externa**

Puedes usar URLs de imágenes de:
- Google Images (pero no recomendado - pueden desaparecer)
- Imágenes de Unsplash, Pexels, etc.
- Cualquier URL pública de imagen

**Pasos:**
1. Encuentra la imagen que quieres usar
2. Haz clic derecho en la imagen → "Copiar dirección de imagen" o "Copy image address"
3. En el formulario de producto, pega la URL en el campo "Imagen"
4. Guarda el producto

**⚠️ IMPORTANTE - URLs de Google Images:**
- Las URLs de Google Images suelen ser temporales y pueden dejar de funcionar
- **NO RECOMENDADO** para uso permanente
- Si usas Google Images, copia la URL completa que termina en `.jpg`, `.png`, etc.

**Ejemplo de URL válida:**
```
https://example.com/imagen-producto.jpg
```

**Ejemplo de URL de Google (puede dejar de funcionar):**
```
https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9Gc...
```

---

### 3. **Importar desde Excel con URLs**

Al importar productos desde Excel, puedes incluir URLs de imágenes en la columna "Imagen (URL)".

**Formato del Excel:**
| Nombre | Descripción | Precio | Stock | Categoría | Imagen (URL) |
|--------|-------------|--------|-------|-----------|--------------|
| Martillo | ... | 25.99 | 50 | Herramientas | https://ejemplo.com/martillo.jpg |

**Nota:** Si no proporcionas una imagen, el sistema intentará buscar una automáticamente.

---

## 🔍 ¿Cómo Obtener una URL de Imagen de Google?

### Método 1: Desde Google Images (No recomendado)
1. Busca la imagen en Google Images
2. Haz clic derecho en la imagen
3. Selecciona "Abrir imagen en nueva pestaña"
4. Copia la URL de la barra de direcciones
5. ⚠️ Esta URL puede dejar de funcionar después de un tiempo

### Método 2: Descargar y Subir (Recomendado)
1. Busca la imagen en Google Images
2. Descarga la imagen a tu computadora
3. Usa el método 1 (Subir desde archivo) para subirla
4. ✅ Esta es la forma más segura y permanente

---

## 📋 Mejores Prácticas

### ✅ Hacer:
- Subir imágenes desde archivo cuando sea posible
- Usar imágenes de alta calidad (mínimo 400x400px)
- Formato JPG o PNG
- Tamaño máximo: 5MB
- Imágenes con fondo blanco o transparente

### ❌ Evitar:
- URLs de Google Images directamente (son temporales)
- Imágenes con derechos de autor sin permiso
- URLs de sitios que pueden desaparecer
- Imágenes muy grandes (optimiza antes de subir)

---

## 🛠️ Solución de Problemas

### La imagen no se muestra:
1. Verifica que la URL sea accesible públicamente
2. Asegúrate de que la URL termine en `.jpg`, `.png`, `.gif`, etc.
3. Prueba abrir la URL directamente en el navegador
4. Si es una URL de Google, puede haber expirado - descarga y sube la imagen

### Error al subir archivo:
1. Verifica que el archivo sea una imagen (JPG, PNG, GIF)
2. Asegúrate de que el tamaño sea menor a 5MB
3. Intenta con otra imagen para descartar problemas del archivo

### La imagen se ve borrosa:
1. Usa imágenes de al menos 400x400 píxeles
2. Evita ampliar imágenes pequeñas
3. Usa formato PNG para imágenes con texto o logos

---

## 📝 Resumen Rápido

**Para uso permanente y profesional:**
👉 **Sube la imagen desde archivo** usando el botón "Seleccionar archivo"

**Para pruebas rápidas:**
👉 Puedes usar URLs externas, pero descarga y sube la imagen después

**Para importación masiva:**
👉 Incluye URLs en la columna "Imagen (URL)" del Excel, o deja vacío para búsqueda automática
