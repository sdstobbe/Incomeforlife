import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', '.vercel', 'output');
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/((?!api/).*)', dest: '/index.html' },
    ],
  })
);
