import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));

function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return result;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.substring(0, eq).trim();
      let val = trimmed.substring(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      result[key] = val;
    }
  }
  return result;
}

const envFromFile = parseEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, ['VITE_', 'CLERK_', 'BACKEND_']);

  const backendTarget =
    process.env.BACKEND_URL ||
    envFromFile.BACKEND_URL ||
    env.BACKEND_URL ||
    env.VITE_BACKEND_URL ||
    'http://localhost:3000';

  const clerkPublishableKey =
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    envFromFile.VITE_CLERK_PUBLISHABLE_KEY ||
    envFromFile.CLERK_PUBLISHABLE_KEY ||
    env.VITE_CLERK_PUBLISHABLE_KEY ||
    env.CLERK_PUBLISHABLE_KEY ||
    '';

  const proxyConfig = {
    '/api': {
      target: backendTarget,
      changeOrigin: true,
    },
    '/auth': {
      target: backendTarget,
      changeOrigin: true,
    },
    '/agent': {
      target: backendTarget,
      changeOrigin: true,
    },
    '/health': {
      target: backendTarget,
      changeOrigin: true,
    },
  };

  return {
    envDir: rootDir,
    envPrefix: ['VITE_', 'CLERK_'],
    define: {
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkPublishableKey),
      'import.meta.env.CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkPublishableKey),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: proxyConfig,
    },
    preview: {
      host: '0.0.0.0',
      port: 5173,
      proxy: proxyConfig,
    },
  };
});
