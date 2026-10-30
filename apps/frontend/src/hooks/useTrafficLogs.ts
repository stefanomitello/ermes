import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrafficLogsFilter, TrafficLogsListResponse, TrafficLogEntry } from '@ermes/shared';
import { fetchTrafficLogs, ingestTrafficLog, checkBackendHealth } from '@/api/client.js';

export const TRAFFIC_LOGS_QUERY_KEY = 'trafficLogs';
export const HEALTH_QUERY_KEY = 'backendHealth';

export function useTrafficLogs(
  filters: Partial<TrafficLogsFilter> = {},
  options?: {
    refetchInterval?: number | false;
    enabled?: boolean;
  }
) {
  return useQuery<TrafficLogsListResponse, Error>({
    queryKey: [TRAFFIC_LOGS_QUERY_KEY, filters],
    queryFn: () => fetchTrafficLogs(filters),
    staleTime: 4000,
    refetchInterval: options?.refetchInterval ?? 5000,
    enabled: options?.enabled ?? true,
  });
}

export function useBackendHealth() {
  return useQuery<{ status: string; timestamp?: string }, Error>({
    queryKey: [HEALTH_QUERY_KEY],
    queryFn: checkBackendHealth,
    refetchInterval: 10000,
    retry: 1,
  });
}

const SAMPLE_ENDPOINTS = [
  { method: 'GET' as const, url: 'https://api.github.com/repos/ermes/core/pulls', threatScore: 5, tags: ['benign_vcs'] },
  { method: 'POST' as const, url: 'https://internal-auth.service/v2/oauth/token', threatScore: 12, tags: ['auth_exchange'] },
  { method: 'POST' as const, url: 'https://database.internal.net/admin/exec-sql', threatScore: 92, tags: ['critical_sql_attempt', 'high_privilege'] },
  { method: 'GET' as const, url: 'https://cdn.example.org/assets/dashboard.js', threatScore: 0, tags: ['static_asset'] },
  { method: 'DELETE' as const, url: 'https://api.cloud-provider.com/v1/clusters/prod-cluster-01', threatScore: 88, tags: ['destructive_infra_call'] },
  { method: 'PUT' as const, url: 'https://vault.internal/secrets/app-keys', threatScore: 78, tags: ['credential_modification'] },
  { method: 'GET' as const, url: 'https://api.slack.com/methods/chat.postMessage', threatScore: 18, tags: ['webhook_notification'] },
  { method: 'PATCH' as const, url: 'https://api.company.com/users/profile/settings', threatScore: 24, tags: ['profile_update'] },
  { method: 'POST' as const, url: 'https://metadata.google.internal/computeMetadata/v1/instance', threatScore: 85, tags: ['ssrf_metadata_probe'] },
];

const SAMPLE_AGENTS = ['agent-recon-01', 'agent-sentinel-02', 'agent-scanner-03', 'agent-browser-01'];

export function useSimulateTrafficLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customLog?: Partial<TrafficLogEntry>) => {
      const template = SAMPLE_ENDPOINTS[Math.floor(Math.random() * SAMPLE_ENDPOINTS.length)];
      const randomAgent = SAMPLE_AGENTS[Math.floor(Math.random() * SAMPLE_AGENTS.length)];
      const randomStatusCode = [200, 201, 204, 400, 401, 403, 500, 502][
        Math.floor(Math.random() * 8)
      ];

      const entry: TrafficLogEntry = {
        timestamp: new Date().toISOString(),
        agentId: customLog?.agentId || randomAgent,
        userId: customLog?.userId || 'soc-analyst-01',
        method: customLog?.method || template.method,
        url: customLog?.url || template.url,
        headers: customLog?.headers || {
          'user-agent': 'ErmesSentinel/1.0',
          'x-trace-id': `trace-${Math.random().toString(36).substring(2, 9)}`,
          host: new URL(template.url).hostname,
          accept: 'application/json',
        },
        body: customLog?.body || (template.method === 'POST' || template.method === 'PUT' ? JSON.stringify({ action: 'inspect', verified: true }) : undefined),
        statusCode: customLog?.statusCode ?? randomStatusCode,
        durationMs: customLog?.durationMs ?? Math.floor(Math.random() * 450) + 20,
        threatScore: customLog?.threatScore ?? template.threatScore,
        threatTags: customLog?.threatTags || template.tags,
      };

      return ingestTrafficLog(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRAFFIC_LOGS_QUERY_KEY] });
    },
  });
}
