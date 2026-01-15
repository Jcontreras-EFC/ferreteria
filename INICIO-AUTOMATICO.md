# 🚀 Sistema Automático de Deploy

## ✅ Configuración Completa

Tu sistema ahora tiene **3 formas** de hacer deploy automático:

---

## 📌 OPCIÓN 1: Watch Automático (RECOMENDADA) ⭐

**Una vez que ejecutes esto, TODO será automático:**

```powershell
npm run watch
```

**¿Qué hace?**
- Observa todos tus archivos (components, pages, lib, styles, etc.)
- Cuando guardas cualquier cambio (Ctrl+S), espera 2 segundos
- Automáticamente ejecuta `npm run build`
- Automáticamente ejecuta `npm run deploy`
- **¡Todo sin que hagas nada más!**

**Para detenerlo:** Presiona `Ctrl+C` en la terminal

---

## 📌 OPCIÓN 2: Deploy Manual Cuando Quieras

Si prefieres controlar cuándo se despliega:

```powershell
npm run auto:deploy
```

**¿Qué hace?**
- Ejecuta build
- Ejecuta deploy
- Muestra toda la salida en tu terminal

---

## 📌 OPCIÓN 3: Integración GitHub + Vercel (100% Automático)

Si conectas tu repositorio de GitHub con Vercel:

1. Ve a https://vercel.com
2. Conecta tu repositorio de GitHub
3. Cada vez que hagas `git push`, Vercel automáticamente:
   - Detecta los cambios
   - Hace build
   - Hace deploy
   - **¡Sin que ejecutes ningún comando!**

---

## 🎯 ¿Cuál usar?

- **Si trabajas localmente:** Usa `npm run watch` (Opción 1)
- **Si quieres control manual:** Usa `npm run auto:deploy` (Opción 2)
- **Si trabajas con GitHub:** Configura la integración (Opción 3)

---

## ⚡ Inicio Rápido

Para empezar ahora mismo con watch automático:

```powershell
cd d:\FERRETERIA2
npm run watch
```

¡Y listo! Cada vez que guardes un archivo, se desplegará automáticamente.
