import { spawn } from 'child_process';
import http from 'http';

console.log('Starting Vite development server...');
const viteProcess = spawn('npm', ['run', 'dev'], {
  shell: true,
  stdio: 'inherit',
});

// Helper function to check if the Vite dev server is up
function checkViteReady(callback) {
  const req = http.get('http://localhost:5173', (res) => {
    callback(true);
  });

  req.on('error', () => {
    callback(false);
  });
}

function startElectron() {
  console.log('Vite server is ready! Starting Electron...');
  
  // Set NODE_ENV to development so Electron loads http://localhost:5173 and opens devtools
  const electronProcess = spawn('npx', ['electron', '.'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron closed with code ${code}. Terminating Vite server...`);
    viteProcess.kill();
    process.exit(code);
  });
}

// Poll Vite server until it is ready
const interval = setInterval(() => {
  checkViteReady((ready) => {
    if (ready) {
      clearInterval(interval);
      startElectron();
    }
  });
}, 200);

// Cleanup on exit
process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit();
});
process.on('SIGTERM', () => {
  viteProcess.kill();
  process.exit();
});
