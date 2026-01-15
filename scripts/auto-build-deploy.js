const { spawn } = require('child_process');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  BUILD Y DEPLOY AUTOMÁTICO');
console.log('═══════════════════════════════════════════════════════════\n');

// Función para ejecutar comandos y mostrar salida en tiempo real
function ejecutarComando(comando, args, descripcion) {
  return new Promise((resolve) => {
    console.log(`\n[${descripcion}]`);
    console.log('───────────────────────────────────────────────────────');
    console.log(`Ejecutando: ${comando} ${args.join(' ')}\n`);
    
    const proceso = spawn(comando, args, {
      stdio: 'inherit', // Esto muestra la salida en tiempo real
      shell: true,
      cwd: process.cwd()
    });
    
    proceso.on('close', (code) => {
      console.log('\n───────────────────────────────────────────────────────');
      if (code === 0) {
        console.log(`✅ ${descripcion} - Completado exitosamente\n`);
        resolve(true);
      } else {
        console.log(`❌ ${descripcion} - Falló (código: ${code})\n`);
        resolve(false);
      }
    });
    
    proceso.on('error', (error) => {
      console.error(`❌ Error ejecutando ${descripcion}:`, error.message);
      resolve(false);
    });
  });
}

async function main() {
  // Paso 1: BUILD
  const buildOk = await ejecutarComando('npm', ['run', 'build'], 'BUILD');
  
  if (!buildOk) {
    console.log('❌ Build falló. No se continuará con el deploy.\n');
    process.exit(1);
  }
  
  // Paso 2: DEPLOY
  const deployOk = await ejecutarComando('npm', ['run', 'deploy'], 'DEPLOY');
  
  if (deployOk) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✨ PROCESO COMPLETADO EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🌐 Verifica tu deployment en: https://vercel.com/dashboard');
    console.log('🌐 Tu sitio: https://ferreteria-nu.vercel.app\n');
  } else {
    console.log('⚠️  Deploy puede haber fallado. Verifica en: https://vercel.com/dashboard\n');
  }
}

main().catch((error) => {
  console.error('\n❌ ERROR FATAL:', error.message);
  process.exit(1);
});
