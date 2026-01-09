# 🚀 Guía de Despliegue - Sistema Portable

## Opción Recomendada: Vercel + Supabase

### Paso 1: Preparar Base de Datos (Supabase)

1. **Crear cuenta en Supabase**
   - Ve a https://supabase.com
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto
   - Anota la contraseña de la base de datos

2. **Obtener Connection String**
   - En tu proyecto de Supabase, ve a Settings > Database
   - Copia la "Connection string" (URI)
   - Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Paso 2: Migrar a PostgreSQL

1. **Actualizar schema.prisma**
   - Cambiar `provider = "sqlite"` a `provider = "postgresql"`
   - La URL se configurará en variables de entorno

2. **Crear nueva migración**
   ```bash
   npm run prisma:migrate
   ```

3. **Migrar datos existentes** (si tienes datos importantes)
   - Exportar datos de SQLite
   - Importar a PostgreSQL

### Paso 3: Desplegar en Vercel

1. **Preparar repositorio**
   - Sube tu código a GitHub (si no lo has hecho)
   - Asegúrate de tener un `.gitignore` correcto

2. **Crear cuenta en Vercel**
   - Ve a https://vercel.com
   - Conecta tu cuenta de GitHub
   - Importa tu repositorio

3. **Configurar Variables de Entorno**
   En Vercel, ve a Settings > Environment Variables y agrega:
   - `DATABASE_URL`: Tu connection string de Supabase
   - `JWT_SECRET`: Una clave secreta aleatoria (genera una nueva)
   - `NODE_ENV`: `production`

4. **Configurar Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install && npx prisma generate`

5. **Desplegar**
   - Haz clic en "Deploy"
   - Espera a que termine (2-5 minutos)
   - ¡Listo! Tu app estará en `tu-proyecto.vercel.app`

### Paso 4: Configurar Dominio Personalizado (Opcional)

1. En Vercel, ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones

## Alternativa: Railway (Todo en Uno)

1. **Crear cuenta en Railway**
   - Ve a https://railway.app
   - Conecta GitHub

2. **Crear servicios**
   - Crea un servicio PostgreSQL
   - Crea un servicio desde GitHub (tu repo)

3. **Configurar variables**
   - Railway detecta automáticamente la variable `DATABASE_URL` del servicio PostgreSQL
   - Agrega `JWT_SECRET` manualmente

4. **Desplegar**
   - Railway despliega automáticamente

## Ventajas de cada opción

### Vercel + Supabase
✅ Mejor rendimiento (CDN global)  
✅ Más fácil de usar  
✅ Mejor para Next.js  
✅ Escalable  
✅ Base de datos separada (más flexible)

### Railway
✅ Todo en un solo lugar  
✅ Más simple de configurar inicialmente  
✅ Buena para empezar rápido

## Costos

**Vercel + Supabase:**
- Vercel: Gratis (hasta 100GB bandwidth/mes)
- Supabase: Gratis (500MB base de datos, 2GB bandwidth/mes)

**Railway:**
- $5 crédito gratis/mes
- Después: ~$5-10/mes según uso

## Notas Importantes

1. **Migración de datos**: Si tienes datos importantes en SQLite, necesitarás migrarlos manualmente a PostgreSQL
2. **Archivos subidos**: Los archivos en `/public/uploads` necesitan un servicio de almacenamiento (S3, Cloudinary, etc.) para producción
3. **Variables de entorno**: Nunca subas el archivo `.env` a GitHub
4. **Backups**: Supabase hace backups automáticos, Railway también

## Soporte

Si necesitas ayuda con la migración, puedo ayudarte paso a paso.
