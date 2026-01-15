const { spawn } = require('child_process');
const fs = require('fs');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  BUILD Y DEPLOY AUTOMÁTICO');
console.log('═══════════════════════════════════════════════════════════\n');

// Archivo de log para capturar toda la salida
const logFile = 'deploy-output.log';
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

function escribirLog(mensaje) {
  fs.appendFileSync(logFile, mensaje + '\n');
  console.log(mensaje);
}

// Función para ejecutar comandos y mostrar salida en tiempo real
function ejecutarComando(comando, args, descripcion) {
  return new Promise((resolve) => {
    escribirLog(`\n[${descripcion}]`);
    escribirLog('───────────────────────────────────────────────────────');
    escribirLog(`Ejecutando: ${comando} ${args.join(' ')}\n`);
    
    const proceso = spawn(comando, args, {
      shell: true,
      cwd: process.cwd()
    });
    
    let stdout = '';
    let stderr = '';
    
    proceso.stdout.on('data', (data) => {
      const texto = data.toString();
      stdout += texto;
      escribirLog(texto);
    });
    
    proceso.stderr.on('data', (data) => {
      const texto = data.toString();
      stderr += texto;
      escribirLog(`STDERR: ${texto}`);
    });
    
    proceso.on('close', (code) => {
      escribirLog('\n───────────────────────────────────────────────────────');
      if (code === 0) {
        escribirLog(`✅ ${descripcion} - Completado exitosamente\n`);
        resolve(true);
      } else {
        escribirLog(`❌ ${descripcion} - Falló (código: ${code})\n`);
        resolve(false);
      }
    });
    
    proceso.on('error', (error) => {
      escribirLog(`❌ Error ejecutando ${descripcion}: ${error.message}\n`);
      resolve(false);
    });
  });
}

async function main() {
  // Paso 1: BUILD
  const buildOk = await ejecutarComando('npm', ['run', 'build'], 'BUILD');
  
  if (!buildOk) {
    escribirLog('❌ Build falló. No se continuará con el deploy.\n');
    process.exit(1);
  }
  
  // Paso 2: DEPLOY
  const deployOk = await ejecutarComando('npm', ['run', 'deploy'], 'DEPLOY');
  
  if (deployOk) {
    escribirLog('═══════════════════════════════════════════════════════════');
    escribirLog('✨ PROCESO COMPLETADO EXITOSAMENTE!');
    escribirLog('═══════════════════════════════════════════════════════════\n');
    escribirLog('🌐 Verifica tu deployment en: https://vercel.com/dashboard');
    escribirLog('🌐 Tu sitio: https://ferreteria-nu.vercel.app\n');
  } else {
    escribirLog('⚠️  Deploy puede haber fallado. Verifica en: https://vercel.com/dashboard\n');
  }
  
  escribirLog(`\n📄 Log completo guardado en: ${logFile}`);
}

main().catch((error) => {
  escribirLog(`\n❌ ERROR FATAL: ${error.message}`);
  console.error(error);
  process.exit(1);
});
