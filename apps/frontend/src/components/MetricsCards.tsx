import { Database, AlertOctagon, Bot, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card.js';
import { Skeleton } from './ui/skeleton.js';
import type { TrafficLogEntry } from '@ermes/shared';

interface MetricsCardsProps {
  logs: TrafficLogEntry[];
  total?: number;
  isLoading: boolean;
}

export function MetricsCards({ logs, total, isLoading }: MetricsCardsProps) {
  if (isLoading && logs.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const totalLogs = total ?? logs.length;
  const criticalThreats = logs.filter((l) => (l.threatScore ?? 0) > 50).length;
  const uniqueAgents = new Set(logs.map((l) => l.agentId)).size;
  const avgDuration = logs.length
    ? Math.round(
        logs.reduce((acc, curr) => acc + (curr.durationMs ?? 0), 0) / logs.length
      )
    : 0;

  const criticalPercentage = logs.length
    ? Math.round((criticalThreats / logs.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Logs */}
      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card to-card/60 shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Ingested Logs
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {totalLogs.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Live stream
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active telemetry buffer
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Database className="size-5" />
          </div>
        </CardContent>
      </Card>

      {/* Critical Threats */}
      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card to-card/60 shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Critical Threats
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold tracking-tight text-rose-400">
                {criticalThreats}
              </span>
              {criticalPercentage > 0 && (
                <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                  {criticalPercentage}% of stream
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Threat score &gt; 50/100
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertOctagon className="size-5" />
          </div>
        </CardContent>
      </Card>

      {/* Active Agents */}
      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card to-card/60 shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Agents
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {uniqueAgents}
              </span>
              <span className="text-[11px] font-medium text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                Recon nodes
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Transmitting endpoint probes
            </p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Bot className="size-5" />
          </div>
        </CardContent>
      </Card>

      {/* Latency / Duration */}
      <Card className="relative overflow-hidden border-border/70 bg-gradient-to-br from-card to-card/60 shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Avg Latency
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {avgDuration} <span className="text-sm font-normal text-muted-foreground">ms</span>
              </span>
              <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                RTT
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Agent HTTP request duration
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="size-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
