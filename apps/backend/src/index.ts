import './env.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { connectMongo } from './db.js';

export const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors());

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = Number(process.env.BACKEND_PORT) || 3000;

async function bootstrap() {
  try {
    await connectMongo();
    console.log(`MongoDB connesso.`);
  } catch (err) {
    console.warn(`Warning: Mongo ha un errore: ${(err as Error).message}`);
  }

  serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    (info) => {
      console.log(`Backend avviato su ${process.env.BACKEND_URL}:${info.port}`);
    }
  );
}

bootstrap();
