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

  const res = await fetch(`${agentConfig.backendUrl}/agent/traffic_logs`, {
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

export async function main() {
  console.log(`Agente [${agentConfig.agentId}]...`);
  console.log(`Connesso al backend: ${agentConfig.backendUrl}`);
  console.log(`Ms asleep: ${agentConfig.simulationIntervalMs}ms`);

  const sampleLog = generateTrafficLog();

  const response = await sendTrafficLog(sampleLog, agentConfig.authToken);
  console.log(`Traffico inviato:`, response);
}

if (process.env.NODE_ENV !== 'test') {
  main().catch((err) => {
    console.error('Errore:', err);
    process.exit(1);
  });
}
