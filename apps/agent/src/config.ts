import './env.js';
import { AgentConfigSchema, type AgentConfig } from '@ermes/shared';

export function loadAgentConfig(env: NodeJS.ProcessEnv = process.env): AgentConfig {
  if (!env.BACKEND_URL || !env.BACKEND_PORT) {
    throw new Error('BACKEND_URL and BACKEND_PORT are required');
  }
  const raw = {
    backendUrl: `${env.BACKEND_URL?.trim()}:${env.BACKEND_PORT?.trim() || 3000}`,
    agentId: env.AGENT_ID?.trim() || 'agent-worker-01',
    authToken: env.AUTH_TOKEN?.trim() || undefined,
    simulationIntervalMs: env.SIMULATION_INTERVAL_MS ? Number(env.SIMULATION_INTERVAL_MS) : 1000,
    userId: env.USER_ID?.trim() || 'user-endpoint-42',
  };

  return AgentConfigSchema.parse(raw);
}

export const agentConfig: AgentConfig = loadAgentConfig();
