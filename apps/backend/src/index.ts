import './env.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { connectMongo } from './db.js';
import { agentRouter } from './routes/agent.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.middleware.js';

export const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors());

app.notFound(notFoundHandler);
app.onError(errorHandler);

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Versioning: v1 endpoints
const router = new Hono();
router.route('/agent', agentRouter);
router.route('/auth', authRouter);

app.route('/api/v1', router);

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
      console.log(`Backend avviato su http://localhost:${info.port}`);
    }
  );
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
