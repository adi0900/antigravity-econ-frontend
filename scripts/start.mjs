import { spawn } from 'node:child_process';

const port = process.env.PORT || '4173';

const child = spawn(
  process.execPath,
  ['./node_modules/serve/build/main.js', '-s', 'dist', '-l', port],
  { stdio: 'inherit' }
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
