import { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Sun,
  Moon,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from './ui/button.js';
import { Spinner } from './ui/spinner.js';
import { useBackendHealth } from '@/hooks/useTrafficLogs.js';

interface NavbarProps {
  onSimulate: () => void;
  isSimulating: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
}

export function Navbar({
  onSimulate,
  isSimulating,
  onRefresh,
  isRefreshing,
  autoRefresh,
  setAutoRefresh,
}: NavbarProps) {
  const { data: health, isError } = useBackendHealth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ermes-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('ermes-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isOnline = !isError && health?.status === 'ok';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-[#e62d22] backdrop-blur-md transition-colors text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div>
            <img
              src="https://www.ermes.company/img/logo/ermes-hrz-red.webp"
              alt="ERMES"
              className="h-16"
            />
          </div>
        </div>

        {/* Center / Health Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/20 text-xs">
            <span className="relative flex size-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOnline ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full size-2 ${
                  isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="font-medium text-white">
              {isOnline ? 'Backend Online' : 'Backend Offline'}
            </span>
            {isOnline ? (
              <CheckCircle2 className="size-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="size-3.5 text-rose-400" />
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`hidden md:inline-flex text-xs h-8 gap-1.5 ${
              autoRefresh
                ? 'border-white-500/40 text-white bg-white-500/10'
                : 'text-muted-foreground'
            }`}
          >
            <Activity
              className={`size-3.5 ${autoRefresh ? 'animate-pulse text-white' : 'text-primary'}`}
            />
            {autoRefresh ? 'Live Feed On' : 'Live Feed Paused'}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 gap-1.5 text-black dark:text-white"
            title="Refresh logs"
          >
            <RefreshCw className={`size-4 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-foreground">Refresh</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onSimulate}
            disabled={isSimulating}
            className="h-9 px-3.5 gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium shadow-md shadow-blue-500/25"
          >
            {isSimulating ? (
              <Spinner size={16} className="text-white" />
            ) : (
              <Zap className="size-4" />
            )}
            <span className="hidden sm:inline">Simulate Agent Ingestion</span>
            <span className="sm:hidden">Simulate</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="size-9 rounded-lg"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="size-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="size-4 text-slate-700 transition-transform hover:-rotate-12" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
