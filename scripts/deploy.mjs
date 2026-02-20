import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const env = {};
try {
  readFileSync(join(__dirname, '..', '.env'), 'utf8')
    .split('\n')
    .forEach((line) => {
      const eq = line.indexOf('=');
      if (eq > 0) {
        const key = line.slice(0, eq).trim();
        const val = line.slice(eq + 1).trim();
        if (key) env[key] = val;
      }
    });
} catch {
  console.error('No .env file found at repo root');
  process.exit(1);
}

const service = process.argv[2];
const urlKey = `RENDER_DEPLOY_HOOK_${service?.toUpperCase()}`;
const url = env[urlKey];

if (!url) {
  console.error(`${urlKey} not set in .env`);
  process.exit(1);
}

const res = await fetch(url);
console.log(`${res.status} ${service} deploy triggered`);
