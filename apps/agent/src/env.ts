import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

function findEnvFile(startDir: string): string | null {
  let currentDir = startDir;
  while (true) {
    const envPath = path.resolve(currentDir, '.env');
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) {
      break;
    }
    currentDir = parent;
  }
  return null;
}

const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = findEnvFile(process.cwd()) || findEnvFile(currentFileDir);

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}
