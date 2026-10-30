import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './ui/table.js';
import { HttpMethodBadge, ThreatScoreBadge } from './ui/badge.js';
import { Skeleton } from './ui/skeleton.js';
import { Button } from './ui/button.js';
import { Eye, Sparkles, Inbox } from 'lucide-react';
import type { TrafficLogEntry } from '@ermes/shared';

interface TrafficTableProps {
  logs: TrafficLogEntry[];
  isLoading: boolean;
  onSelectLog: (log: TrafficLogEntry) => void;
  onSimulate: () => void;
  isSimulating: boolean;
}

export function TrafficTable({
  logs,
  isLoading,
  onSelectLog,
  onSimulate,
  isSimulating,
}: TrafficTableProps) {
  const getStatusCodeBadge = (code?: number) => {
    if (!code) return <span className="text-muted-foreground">-</span>;
    let color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (code >= 300 && code < 400) {
      color = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    } else if (code >= 400 && code < 500) {
      color = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (code >= 500) {
      color = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border ${color}`}
      >
        {code}
      </span>
    );
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-border/80 bg-card/40 backdrop-blur-sm p-12 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted/40 border border-border mb-4">
          <Inbox className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          No HTTP traffic telemetry found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
          No logs match the current filters, or no telemetry has been transmitted by agents yet.
        </p>
        <Button
          onClick={onSimulate}
          disabled={isSimulating}
          className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20"
        >
          <Sparkles className="size-4" />
          Generate Simulated Telemetry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[110px]">Time</TableHead>
            <TableHead className="w-[140px]">Agent</TableHead>
            <TableHead className="w-[85px]">Method</TableHead>
            <TableHead>Target Destination URL</TableHead>
            <TableHead className="w-[90px] text-center">Status</TableHead>
            <TableHead className="w-[160px]">Threat Score</TableHead>
            <TableHead className="w-[80px] text-right">Inspect</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => {
            const isHighThreat = (log.threatScore ?? 0) >= 50;
            const isCritical = (log.threatScore ?? 0) >= 75;

            return (
              <TableRow
                key={log.id || `${log.timestamp}-${index}`}
                onClick={() => onSelectLog(log)}
                className={`cursor-pointer transition-colors group ${
                  isCritical
                    ? 'hover:bg-rose-500/10 bg-rose-500/5'
                    : isHighThreat
                    ? 'hover:bg-amber-500/10 bg-amber-500/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                {/* Timestamp */}
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </TableCell>

                {/* Agent ID */}
                <TableCell className="font-mono text-xs font-medium text-foreground truncate max-w-[140px]">
                  {log.agentId}
                </TableCell>

                {/* HTTP Method */}
                <TableCell>
                  <HttpMethodBadge method={log.method} />
                </TableCell>

                {/* Target URL */}
                <TableCell className="max-w-[380px] truncate font-mono text-xs text-foreground group-hover:text-primary transition-colors">
                  <span title={log.url}>{log.url}</span>
                </TableCell>

                {/* Status code */}
                <TableCell className="text-center">
                  {getStatusCodeBadge(log.statusCode)}
                </TableCell>

                {/* Threat Score */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ThreatScoreBadge score={log.threatScore} />
                    {log.threatTags && log.threatTags.length > 0 && (
                      <span className="hidden xl:inline-block text-[10px] font-mono text-muted-foreground truncate max-w-[90px]">
                        {log.threatTags[0]}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Inspect Action */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-70 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLog(log);
                    }}
                    title="Inspect telemetry details"
                  >
                    <Eye className="size-3.5" />
                    <span className="sr-only">Inspect</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
