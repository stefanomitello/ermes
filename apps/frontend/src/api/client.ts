import type {
  TrafficLogEntry,
  BatchTrafficLogs,
  TrafficLogsFilter,
  TrafficLogsListResponse,
  AuthTokenResponse,
} from '@ermes/shared';

const API_BASE = '/api/v1';

let cachedToken: string | null = null;

export async function getAuthToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  try {
    const res = await fetch(`${API_BASE}/auth/agent/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'dashboard-ui',
        userId: 'analyst-admin',
      }),
    });
    if (res.ok) {
      const data: AuthTokenResponse = await res.json();
      cachedToken = data.accessToken;
      return data.accessToken;
    }
  } catch {
    // If auth fails or not enabled, continue
  }
  return '';
}

export async function checkBackendHealth(): Promise<{ status: string; timestamp?: string }> {
  const res = await fetch('/health');
  if (!res.ok) {
    throw new Error(`Health check failed with status: ${res.status}`);
  }
  return res.json();
}

export async function fetchTrafficLogs(
  filters: Partial<TrafficLogsFilter> = {}
): Promise<TrafficLogsListResponse> {
  const params = new URLSearchParams();
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.page) params.set('page', String(filters.page));
  if (filters.agentId) params.set('agentId', filters.agentId);
  if (filters.userId) params.set('userId', filters.userId);
  if (filters.method) params.set('method', filters.method);
  if (filters.threatScoreMin !== undefined && filters.threatScoreMin !== null) {
    params.set('threatScoreMin', String(filters.threatScoreMin));
  }
  if (filters.threatScoreMax !== undefined && filters.threatScoreMax !== null) {
    params.set('threatScoreMax', String(filters.threatScoreMax));
  }
  if (filters.search) params.set('search', filters.search);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const token = await getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Attempt standard API v1 path first, fallback to /agent/traffic_logs if needed
  let res = await fetch(`${API_BASE}/agent/traffic_logs${queryString}`, { headers });
  if (res.status === 404) {
    res = await fetch(`/agent/traffic_logs${queryString}`, { headers });
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch logs: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    logs: data.logs || [],
    total: data.total ?? data.logs?.length ?? 0,
    nextCursor: data.nextCursor,
  };
}

export async function ingestTrafficLog(
  payload: TrafficLogEntry | BatchTrafficLogs
): Promise<{ success: boolean; count: number; receivedAt: string }> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}/agent/traffic_logs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 404) {
    res = await fetch(`/agent/traffic_logs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Ingestion failed: ${res.status} - ${errorBody}`);
  }

  return res.json();
}
