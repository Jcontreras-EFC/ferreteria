# 📋 Despliegue Paso a Paso - SIN GitHub

## Guía Completa: Vercel CLI + Supabase

### PARTE 1: Preparar Base de Datos (Supabase)

#### Paso 1.1: Crear cuenta en Supabase
1. Ve a https://supabase.com
2. Haz clic en "Start your project"
3. Crea una cuenta (puedes usar Google/GitHub para más rápido)
4. Haz clic en "New Project"

#### Paso 1.2: Crear proyecto
1. **Name**: Ponle un nombre (ej: "ferreteria-db")
2. **Database Password**: Crea una contraseña SEGURA (anótala, la necesitarás)
3. **Region**: Elige la más cercana a ti
4. Haz clic en "Create new project"
5. Espera 2-3 minutos a que se cree

#### Paso 1.3: Obtener Connection String
1. En tu proyecto, ve a **Settings** (icono de engranaje) > **Database**
2. Busca la sección "Connection string"
3. Selecciona "URI" (no "Session mode")
4. Copia la URL que aparece (algo como):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. **IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste
6. Guarda esta URL completa, la necesitarás después

---

### PARTE 2: Migrar a PostgreSQL

#### Paso 2.1: Actualizar Schema de Prisma

Abre el archivo `prisma/schema.prisma` y cambia:

**ANTES:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**DESPUÉS:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### Paso 2.2: Actualizar archivo .env

Abre tu archivo `.env` y cambia:

**ANTES:**
```
DATABASE_URL="file:./prisma/dev.db"
```

**DESPUÉS:**
```
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

(Usa la URL que copiaste de Supabase)

#### Paso 2.3: Generar cliente y crear tablas

Abre PowerShell en tu carpeta del proyecto y ejecuta:

```powershell
# Generar cliente de Prisma para PostgreSQL
npm run prisma:generate

# Crear las tablas en la base de datos
npm run prisma:migrate
```

Cuando te pregunte el nombre de la migración, pon: `init_postgresql`

#### Paso 2.4: Verificar que funciona

```powershell
npm run dev
```

Abre http://localhost:3000 y verifica que todo funcione.

---

### PARTE 3: Desplegar en Vercel (SIN GitHub)

#### Paso 3.1: Instalar Vercel CLI

En PowerShell, ejecuta:

```powershell
npm install -g vercel
```

Espera a que termine la instalación.

#### Paso 3.2: Iniciar sesión en Vercel

```powershell
vercel login
```

1. Se abrirá tu navegador automáticamente
2. Si no tienes cuenta, créala (es gratis)
3. Inicia sesión
4. Vuelve a PowerShell

#### Paso 3.3: Desplegar tu proyecto

Asegúrate de estar en la carpeta de tu proyecto:

```powershell
cd D:\FERRETERIA2
```

Luego ejecuta:

```powershell
vercel
```

Te hará algunas preguntas:

1. **Set up and deploy "D:\FERRETERIA2"?** 
   → Presiona **Enter** (Sí)

2. **Which scope do you want to deploy to?**
   → Selecciona tu cuenta (presiona Enter)

3. **Link to existing project?**
   → Presiona **N** (No, crear nuevo proyecto)

4. **What's your project's name?**
   → Presiona **Enter** (usa el nombre por defecto o ponle uno)

5. **In which directory is your code located?**
   → Presiona **Enter** (usa "./" que es el directorio actual)

6. **Want to override the settings?**
   → Presiona **N** (No)

Espera 2-5 minutos mientras se despliega.

Al final te dará una URL como: `https://tu-proyecto.vercel.app`

#### Paso 3.4: Configurar Variables de Entorno

1. Ve a https://vercel.com
2. Inicia sesión
3. Haz clic en tu proyecto
4. Ve a **Settings** > **Environment Variables**
5. Agrega estas variables:

   **Variable 1:**
   - Name: `DATABASE_URL`
   - Value: (Pega la URL de Supabase que copiaste)
   - Environment: Selecciona "Production", "Preview" y "Development"

   **Variable 2:**
   - Name: `JWT_SECRET`
   - Value: (Genera una clave aleatoria, por ejemplo: `mi-clave-super-secreta-2024-ferreteria`)
   - Environment: Selecciona todas

   **Variable 3:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Environment: Solo "Production"

6. Haz clic en "Save" para cada una

#### Paso 3.5: Redesplegar con las variables

Vuelve a PowerShell y ejecuta:

```powershell
vercel --prod
```

Espera a que termine.

#### Paso 3.6: ¡Listo!

Abre la URL que te dio Vercel. Tu aplicación debería estar funcionando.

---

## Resumen de Comandos

```powershell
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Iniciar sesión
vercel login

# 3. Desplegar
vercel

# 4. Desplegar a producción (después de configurar variables)
vercel --prod
```

---

## Troubleshooting

### Error: "Cannot find module"
```powershell
npm install
vercel --prod
```

### Error: "Database connection failed"
- Verifica que la `DATABASE_URL` en Vercel sea correcta
- Asegúrate de haber reemplazado `[YOUR-PASSWORD]` con tu contraseña real

### Error: "Prisma Client not generated"
En Vercel, ve a Settings > Build & Development Settings y agrega:
- Build Command: `npm install && npx prisma generate && npm run build`

### La app no carga
- Espera 2-3 minutos después del despliegue
- Verifica los logs en Vercel (Deployments > tu deployment > Logs)

---

## ¿Necesitas ayuda?

Si tienes algún problema en algún paso, avísame y te ayudo.
