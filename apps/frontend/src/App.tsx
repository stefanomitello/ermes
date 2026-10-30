import { useState, useMemo } from 'react';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { Navbar } from './components/Navbar.js';
import { MetricsCards } from './components/MetricsCards.js';
import { FiltersBar, type FilterState } from './components/FiltersBar.js';
import { TrafficTable } from './components/TrafficTable.js';
import { LogDetailModal } from './components/LogDetailModal.js';
import { useTrafficLogs, useSimulateTrafficLog } from './hooks/useTrafficLogs.js';
import type { TrafficLogEntry, TrafficLogsFilter } from '@ermes/shared';

function DashboardView() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<TrafficLogEntry | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    method: '',
    threatSeverity: '',
    agentId: '',
  });

  const serverFilters: Partial<TrafficLogsFilter> = useMemo(() => {
    const params: Partial<TrafficLogsFilter> = {
      limit: 100,
    };
    if (filters.method) {
      params.method = filters.method;
    }
    if (filters.agentId) {
      params.agentId = filters.agentId;
    }
    return params;
  }, [filters.method, filters.agentId]);

  const { data, isLoading, isFetching, refetch } = useTrafficLogs(serverFilters, {
    refetchInterval: autoRefresh ? 4000 : false,
  });

  const simulateMutation = useSimulateTrafficLog();

  const rawLogs = useMemo(() => data?.logs || [], [data?.logs]);

  const availableAgents = useMemo(() => {
    const set = new Set<string>();
    rawLogs.forEach((l) => {
      if (l.agentId) set.add(l.agentId);
    });
    return Array.from(set).sort();
  }, [rawLogs]);

  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesUrl = log.url.toLowerCase().includes(query);
        const matchesAgent = log.agentId.toLowerCase().includes(query);
        const matchesMethod = log.method.toLowerCase().includes(query);
        const matchesTags = log.threatTags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesUrl && !matchesAgent && !matchesMethod && !matchesTags) {
          return false;
        }
      }

      if (filters.threatSeverity) {
        const score = log.threatScore ?? 0;
        switch (filters.threatSeverity) {
          case 'critical':
            if (score < 75) return false;
            break;
          case 'high':
            if (score < 50) return false;
            break;
          case 'medium':
            if (score < 25 || score >= 50) return false;
            break;
          case 'low':
            if (score >= 25) return false;
            break;
        }
      }

      if (filters.method && log.method !== filters.method) {
        return false;
      }

      if (filters.agentId && log.agentId !== filters.agentId) {
        return false;
      }

      return true;
    });
  }, [rawLogs, filters]);

  const handleSimulate = async () => {
    try {
      await simulateMutation.mutateAsync();
    } catch (err) {
      console.error('Failed to simulate log', err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navigation */}
      <Navbar
        onSimulate={handleSimulate}
        isSimulating={simulateMutation.isPending}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Cards Summary */}
        <MetricsCards logs={rawLogs} total={data?.total} isLoading={isLoading} />

        {/* Filters Toolbar */}
        <FiltersBar
          filters={filters}
          onFilterChange={setFilters}
          availableAgents={availableAgents}
        />

        {/* Results Count & Status */}
        <div className="flex items-center justify-between mb-3 px-1 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{filteredLogs.length}</span> of{' '}
            <span className="font-semibold text-foreground">{rawLogs.length}</span> logs
            {rawLogs.length !== filteredLogs.length && ' (filtered)'}
          </div>
          {isFetching && !isLoading && (
            <span className="text-cyan-400 animate-pulse">Syncing feed...</span>
          )}
        </div>

        {/* Interactive Logs Table */}
        <TrafficTable
          logs={filteredLogs}
          isLoading={isLoading}
          onSelectLog={setSelectedLog}
          onSimulate={handleSimulate}
          isSimulating={simulateMutation.isPending}
        />
      </main>

      {/* Modal Inspector */}
      <LogDetailModal
        log={selectedLog}
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        Ermes
      </footer>
    </div>
  );
}

function LoginView() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle ambient light effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col items-center space-y-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-3">
          <img
            src="https://www.ermes.company/img/logo/ermes-hrz-red.webp"
            alt="ERMES"
            className="h-16"
          />
        </div>

        <div className="w-full flex justify-center   p-2">
          <SignIn routing="hash" />
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <>
      <SignedIn>
        <DashboardView />
      </SignedIn>
      <SignedOut>
        <LoginView />
      </SignedOut>
    </>
  );
}

export default App;
