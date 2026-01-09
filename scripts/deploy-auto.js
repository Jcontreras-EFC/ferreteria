// Script para hacer deploy automático a Vercel cuando guardas cambios
// Ejecuta: node scripts/deploy-auto.js

const { exec } = require('child_process')
const chokidar = require('chokidar')
const path = require('path')

console.log('🚀 Iniciando watch mode para deploy automático...\n')
console.log('📝 Guarda cualquier archivo y se desplegará automáticamente a Vercel\n')

let deployTimeout = null
let isDeploying = false

function deploy() {
  if (isDeploying) {
    console.log('⏳ Ya hay un deploy en proceso, esperando...\n')
    return
  }

  isDeploying = true
  console.log('📤 Iniciando deploy a Vercel...\n')

  exec('vercel --prod --yes', (error, stdout, stderr) => {
    isDeploying = false
    
    if (error) {
      console.error('❌ Error en deploy:', error.message)
      return
    }

    console.log('✅ Deploy completado!\n')
    console.log(stdout)
    
    if (stderr) {
      console.error('⚠️  Advertencias:', stderr)
    }
  })
}

// Observar cambios en archivos importantes
const watcher = chokidar.watch([
  'components/**/*.js',
  'pages/**/*.js',
  'lib/**/*.js',
  'styles/**/*.css',
  'public/**/*',
  'next.config.js',
  'package.json',
  'tailwind.config.js'
], {
  ignored: /node_modules|\.next|\.vercel/,
  persistent: true
})

watcher.on('change', (filePath) => {
  console.log(`📝 Archivo modificado: ${filePath}`)
  
  // Esperar 2 segundos antes de hacer deploy (por si guardas varios archivos)
  if (deployTimeout) {
    clearTimeout(deployTimeout)
  }
  
  deployTimeout = setTimeout(() => {
    deploy()
  }, 2000)
})

console.log('👀 Observando cambios... (Presiona Ctrl+C para detener)\n')
