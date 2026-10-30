import { TrafficLogEntrySchema, type TrafficLogEntry, type HttpMethod } from '@ermes/shared';
import { agentConfig } from './config.js';

export type TrafficCategory = 'standard' | 'warning' | 'threat';

export interface GenerateTrafficLogOptions {
  agentId?: string;
  userId?: string;
  category?: TrafficCategory;
  timestamp?: string;
}

interface TrafficTemplate {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  statusCode: number;
  threatScoreMin: number;
  threatScoreMax: number;
  threatTags: string[];
}

const STANDARD_TEMPLATES: TrafficTemplate[] = [
  {
    method: 'GET',
    url: 'https://ermes.com/api/v1/profile',
    headers: {
      'user-agent': 'ErmesAgent/1.0 (Desktop; macOS)',
      accept: 'application/json',
    },
    statusCode: 200,
    threatScoreMin: 0,
    threatScoreMax: 10,
    threatTags: ['standard_api_call'],
  },
  {
    method: 'POST',
    url: 'https://ermes.com/api/v1/checkout',
    headers: {
      'user-agent': 'ErmesAgent/1.0 (Desktop; macOS)',
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: '{"cartId":"c-9921","currency":"EUR"}',
    statusCode: 201,
    threatScoreMin: 5,
    threatScoreMax: 20,
    threatTags: ['transaction_created'],
  },
  {
    method: 'PUT',
    url: 'https://ermes.com/api/v1/settings',
    headers: {
      'user-agent': 'ErmesAgent/1.0 (Desktop; macOS)',
      'content-type': 'application/json',
    },
    body: '{"notifications":true,"theme":"dark"}',
    statusCode: 200,
    threatScoreMin: 0,
    threatScoreMax: 15,
    threatTags: ['user_preference_update'],
  },
];

const WARNING_TEMPLATES: TrafficTemplate[] = [
  {
    method: 'GET',
    url: 'https://ermes.com/api/v1/deprecated-resource',
    headers: {
      'user-agent': 'ErmesAgent/1.0 (Desktop; macOS)',
      accept: '*/*',
    },
    statusCode: 404,
    threatScoreMin: 30,
    threatScoreMax: 50,
    threatTags: ['not_found', 'repeated_404'],
  },
  {
    method: 'GET',
    url: 'https://unknown-cdn.xyz/assets/bundle.js',
    headers: {
      'user-agent': 'ErmesAgent/1.0 (Desktop; macOS)',
      accept: 'application/javascript',
    },
    statusCode: 200,
    threatScoreMin: 35,
    threatScoreMax: 60,
    threatTags: ['unfamiliar_external_domain'],
  },
  {
    method: 'POST',
    url: 'https://ermes.com/api/v1/telemetry',
    headers: {
      'user-agent': 'LegacyClient/0.9',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'event=heartbeat',
    statusCode: 400,
    threatScoreMin: 30,
    threatScoreMax: 55,
    threatTags: ['unexpected_content_type', 'bad_request'],
  },
];

const THREAT_TEMPLATES: TrafficTemplate[] = [
  {
    method: 'GET',
    url: 'https://ermes.com/etc/passwd',
    headers: {
      'user-agent': 'curl/7.79.1',
      accept: '*/*',
    },
    statusCode: 403,
    threatScoreMin: 80,
    threatScoreMax: 98,
    threatTags: ['path_traversal', 'lfi_attempt'],
  },
  {
    method: 'GET',
    url: 'https://ermes.com/api/users?id=1%20OR%201=1',
    headers: {
      'user-agent': 'sqlmap/1.5.11#stable',
      accept: 'application/json',
    },
    statusCode: 400,
    threatScoreMin: 85,
    threatScoreMax: 100,
    threatTags: ['sqli', 'sql_injection_attempt'],
  },
  {
    method: 'POST',
    url: 'https://ermes.com/wp-login.php',
    headers: {
      'user-agent': 'Mozilla/5.0 (Hydra Bruteforce)',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'log=admin&pwd=admin',
    statusCode: 401,
    threatScoreMin: 70,
    threatScoreMax: 95,
    threatTags: ['credential_stuffing', 'bruteforce_attempt'],
  },
  {
    method: 'GET',
    url: 'https://ermes.com/.env',
    headers: {
      'user-agent': 'Nikto/2.1.6',
    },
    statusCode: 404,
    threatScoreMin: 75,
    threatScoreMax: 90,
    threatTags: ['secret_file_probing', 'vulnerability_scanner'],
  },
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateStandardLog(options?: GenerateTrafficLogOptions): TrafficLogEntry {
  const template = getRandomItem(STANDARD_TEMPLATES);
  const raw: TrafficLogEntry = {
    timestamp: options?.timestamp || new Date().toISOString(),
    agentId: options?.agentId || agentConfig.agentId,
    userId: options?.userId || agentConfig.userId,
    method: template.method,
    url: template.url,
    headers: template.headers,
    body: template.body,
    statusCode: template.statusCode,
    durationMs: getRandomInt(20, 150),
    threatScore: getRandomInt(template.threatScoreMin, template.threatScoreMax),
    threatTags: template.threatTags,
  };

  return TrafficLogEntrySchema.parse(raw);
}

export function generateWarningLog(options?: GenerateTrafficLogOptions): TrafficLogEntry {
  const template = getRandomItem(WARNING_TEMPLATES);
  const raw: TrafficLogEntry = {
    timestamp: options?.timestamp || new Date().toISOString(),
    agentId: options?.agentId || agentConfig.agentId,
    userId: options?.userId || agentConfig.userId,
    method: template.method,
    url: template.url,
    headers: template.headers,
    body: template.body,
    statusCode: template.statusCode,
    durationMs: getRandomInt(100, 350),
    threatScore: getRandomInt(template.threatScoreMin, template.threatScoreMax),
    threatTags: template.threatTags,
  };

  return TrafficLogEntrySchema.parse(raw);
}

export function generateThreatLog(options?: GenerateTrafficLogOptions): TrafficLogEntry {
  const template = getRandomItem(THREAT_TEMPLATES);
  const raw: TrafficLogEntry = {
    timestamp: options?.timestamp || new Date().toISOString(),
    agentId: options?.agentId || agentConfig.agentId,
    userId: options?.userId || agentConfig.userId,
    method: template.method,
    url: template.url,
    headers: template.headers,
    body: template.body,
    statusCode: template.statusCode,
    durationMs: getRandomInt(180, 750),
    threatScore: getRandomInt(template.threatScoreMin, template.threatScoreMax),
    threatTags: template.threatTags,
  };

  return TrafficLogEntrySchema.parse(raw);
}

export function generateTrafficLog(options?: GenerateTrafficLogOptions): TrafficLogEntry {
  if (options?.category === 'standard') {
    return generateStandardLog(options);
  }
  if (options?.category === 'warning') {
    return generateWarningLog(options);
  }
  if (options?.category === 'threat') {
    return generateThreatLog(options);
  }

  const roll = Math.random();
  if (roll < 0.7) {
    return generateStandardLog(options);
  }
  if (roll < 0.9) {
    return generateWarningLog(options);
  }
  return generateThreatLog(options);
}

export function generateBatchLogs(
  count: number,
  options?: GenerateTrafficLogOptions
): TrafficLogEntry[] {
  const safeCount = Math.max(count, 1);
  return Array.from({ length: safeCount }, () => generateTrafficLog(options));
}
