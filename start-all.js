import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting Autolider Fullstack (Express Backend + Vite Frontend)...');

const nodeExec = process.execPath;
const viteBin = path.join('node_modules', 'vite', 'bin', 'vite.js');

const serverProc = spawn(nodeExec, ['--watch', 'server/index.js'], { stdio: 'inherit' });
const viteProc = spawn(nodeExec, [viteBin], { stdio: 'inherit' });

process.on('SIGINT', () => {
  serverProc.kill();
  viteProc.kill();
  process.exit();
});
