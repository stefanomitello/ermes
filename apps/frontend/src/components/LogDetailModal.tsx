import { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from './ui/dialog.js';
import { Button } from './ui/button.js';
import { HttpMethodBadge, ThreatScoreBadge } from './ui/badge.js';
import { Copy, Check, Terminal, FileCode, Layers, ShieldAlert, Clock } from 'lucide-react';
import type { TrafficLogEntry } from '@ermes/shared';

interface LogDetailModalProps {
  log: TrafficLogEntry | null;
  open: boolean;
  onClose: () => void;
}

export function LogDetailModal({ log, open, onClose }: LogDetailModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'headers' | 'body' | 'raw'>('overview');

  if (!log) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusColor = (code?: number) => {
    if (!code) return 'text-muted-foreground';
    if (code >= 200 && code < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (code >= 300 && code < 400) return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    if (code >= 400 && code < 500) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <HttpMethodBadge method={log.method} />
          <div>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="font-mono text-sm break-all">{log.url}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Recorded at {new Date(log.timestamp).toLocaleString()} • Agent: <span className="font-mono font-medium text-foreground">{log.agentId}</span>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/60 px-6 pt-2 bg-muted/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="size-3.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'headers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Terminal className="size-3.5" />
          Headers ({Object.keys(log.headers || {}).length})
        </button>
        <button
          onClick={() => setActiveTab('body')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'body'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileCode className="size-3.5" />
          Payload Body {log.body ? '•' : ''}
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'raw'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Raw JSON
        </button>
      </div>

      <DialogContent className="max-h-[60vh] overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Threat Score Panel */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldAlert className="size-4 text-primary" /> Threat Intelligence Score
                </span>
                <ThreatScoreBadge score={log.threatScore} />
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    (log.threatScore ?? 0) >= 75
                      ? 'bg-rose-500'
                      : (log.threatScore ?? 0) >= 50
                      ? 'bg-amber-500'
                      : (log.threatScore ?? 0) >= 25
                      ? 'bg-sky-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(log.threatScore ?? 0, 100)}%` }}
                />
              </div>

              {log.threatTags && log.threatTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground">Detection tags:</span>
                  {log.threatTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-background border border-border/70 text-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Status Code</p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`text-sm font-mono font-bold px-2 py-0.5 rounded border ${getStatusColor(
                      log.statusCode
                    )}`}
                  >
                    {log.statusCode || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Response Duration</p>
                <p className="mt-1 text-sm font-mono font-semibold text-foreground flex items-center gap-1">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {log.durationMs !== undefined ? `${log.durationMs} ms` : 'N/A'}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Agent Identifier</p>
                <p className="mt-1 text-sm font-mono text-foreground truncate">{log.agentId}</p>
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">User Identity</p>
                <p className="mt-1 text-sm font-mono text-foreground truncate">{log.userId}</p>
              </div>
            </div>

            {/* Target URL */}
            <div className="p-3 rounded-lg border border-border/60 bg-muted/10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase">Destination URL</p>
                <button
                  onClick={() => handleCopy(log.url, 'url')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'url' ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copiedKey === 'url' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs font-mono text-foreground break-all bg-background/50 p-2 rounded border border-border/40">
                {log.url}
              </p>
            </div>
          </div>
        )}

        {/* HEADERS TAB */}
        {activeTab === 'headers' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">HTTP Request Headers</p>
              <button
                onClick={() => handleCopy(JSON.stringify(log.headers, null, 2), 'all-headers')}
                className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'all-headers' ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copiedKey === 'all-headers' ? 'Copied Headers' : 'Copy All Headers'}
              </button>
            </div>

            <div className="rounded-lg border border-border/80 bg-background/60 overflow-hidden divide-y divide-border/40 font-mono text-xs">
              {Object.entries(log.headers || {}).map(([key, val]) => (
                <div key={key} className="flex items-start justify-between p-2.5 hover:bg-muted/30">
                  <span className="font-semibold text-cyan-400 select-all shrink-0 mr-3">{key}:</span>
                  <span className="text-muted-foreground text-right select-all break-all">{val}</span>
                </div>
              ))}
              {Object.keys(log.headers || {}).length === 0 && (
                <p className="p-4 text-center text-xs text-muted-foreground font-sans">
                  No headers logged for this request.
                </p>
              )}
            </div>
          </div>
        )}

        {/* BODY TAB */}
        {activeTab === 'body' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Payload Content</p>
              {log.body && (
                <button
                  onClick={() => handleCopy(log.body || '', 'body')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'body' ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copiedKey === 'body' ? 'Copied' : 'Copy Payload'}
                </button>
              )}
            </div>

            {log.body ? (
              <pre className="p-3 rounded-lg border border-border/80 bg-background font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(log.body), null, 2);
                  } catch {
                    return log.body;
                  }
                })()}
              </pre>
            ) : (
              <div className="p-6 text-center border border-dashed border-border/60 rounded-lg text-xs text-muted-foreground">
                No payload body recorded for this {log.method} request.
              </div>
            )}
          </div>
        )}

        {/* RAW JSON TAB */}
        {activeTab === 'raw' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Complete Raw Telemetry Record</p>
              <button
                onClick={() => handleCopy(JSON.stringify(log, null, 2), 'raw-json')}
                className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'raw-json' ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copiedKey === 'raw-json' ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
            <pre className="p-3 rounded-lg border border-border/80 bg-background font-mono text-xs text-muted-foreground overflow-x-auto">
              {JSON.stringify(log, null, 2)}
            </pre>
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
