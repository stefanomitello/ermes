import './env.js';
import { AgentConfigSchema, type AgentConfig } from '@ermes/shared';

export function loadAgentConfig(env: NodeJS.ProcessEnv = process.env): AgentConfig {
  const raw = {
    backendUrl: env.BACKEND_URL?.trim() || 'http://localhost:3000',
    agentId: env.AGENT_ID?.trim() || 'agent-worker-01',
    authToken: env.AUTH_TOKEN?.trim() || undefined,
    simulationIntervalMs: env.SIMULATION_INTERVAL_MS ? Number(env.SIMULATION_INTERVAL_MS) : 1000,
    userId: env.USER_ID?.trim() || 'user-endpoint-42',
  };

  return AgentConfigSchema.parse(raw);
}

export const agentConfig: AgentConfig = loadAgentConfig();
