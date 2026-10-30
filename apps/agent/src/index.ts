import './env.js';
import type { TrafficLogEntry } from '@ermes/shared';
import { agentConfig } from './config.js';
import { generateTrafficLog } from './generator.js';

export async function sendTrafficLog(log: TrafficLogEntry, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${agentConfig.backendUrl}/api/v1/agent/traffic_logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(log),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Errore [${res.status}]: ${err}`);
  }

  return res.json();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runSimulation(options?: {
  loop?: boolean;
  intervalMs?: number;
}): Promise<void> {
  const isLoop = options?.loop ?? process.argv.includes('--loop');
  const interval = options?.intervalMs ?? agentConfig.simulationIntervalMs;

  console.log(`[Ermes Agent] Avviato con ID: "${agentConfig.agentId}"`);
  console.log(`[Ermes Agent] Backend target: ${agentConfig.backendUrl}`);
  console.log(
    `[Ermes Agent] Modalità: ${isLoop ? `CONTINUOUS LOOP (${interval}ms)` : 'ONE-SHOT'}`
  );

  let isRunning = true;

  const handleShutdown = () => {
    if (!isRunning) return;
    console.log('\n[Ermes Agent] Segnale di arresto ricevuto, interruzione loop in corso...');
    isRunning = false;
  };

  process.once('SIGINT', handleShutdown);
  process.once('SIGTERM', handleShutdown);

  let sequence = 0;

  do {
    sequence++;
    try {
      const sampleLog = generateTrafficLog();
      const response = await sendTrafficLog(sampleLog, agentConfig.authToken);
      console.log(
        `[#${sequence}] Telemetria inviata: ${sampleLog.method} ${sampleLog.url} (Threat: ${sampleLog.threatScore}/100) -> HTTP ${response.count ? '201 Created' : 'OK'}`
      );
    } catch (err) {
      console.warn(`[#${sequence}] Invio fallito: ${(err as Error).message}`);
    }

    if (isLoop && isRunning) {
      await sleep(interval);
    }
  } while (isLoop && isRunning);

  console.log('[Ermes Agent] Esecuzione completata.');
}

export async function main() {
  await runSimulation();
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((err) => {
    console.error('[Ermes Agent] Errore critico:', err);
    process.exit(1);
  });
}
