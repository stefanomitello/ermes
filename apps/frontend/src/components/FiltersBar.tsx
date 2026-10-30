import { Search, X, RotateCcw } from 'lucide-react';
import { Input } from './ui/input.js';
import { Select } from './ui/select.js';
import { Button } from './ui/button.js';
import type { HttpMethod } from '@ermes/shared';

export interface FilterState {
  search: string;
  method?: HttpMethod | '';
  threatSeverity?: string;
  agentId?: string;
}

interface FiltersBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableAgents?: string[];
}

export function FiltersBar({
  filters,
  onFilterChange,
  availableAgents = [],
}: FiltersBarProps) {
  const hasActiveFilters = Boolean(
    filters.search || filters.method || filters.threatSeverity || filters.agentId
  );

  const resetFilters = () => {
    onFilterChange({
      search: '',
      method: '',
      threatSeverity: '',
      agentId: '',
    });
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-sm mb-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by URL, path, agent or keyword..."
          value={filters.search}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value })
          }
          className="pl-9 pr-8 h-9 bg-background/50 border-border/80 text-xs sm:text-sm"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: '' })}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            title="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
        {/* Method filter */}
        <div className="w-full sm:w-36">
          <Select
            value={filters.method || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                method: (e.target.value as HttpMethod) || '',
              })
            }
            className="h-9 bg-background/50 border-border/80 text-xs"
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </Select>
        </div>

        {/* Severity filter */}
        <div className="w-full sm:w-44">
          <Select
            value={filters.threatSeverity || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                threatSeverity: e.target.value,
              })
            }
            className="h-9 bg-background/50 border-border/80 text-xs"
          >
            <option value="">All Threat Levels</option>
            <option value="critical">Critical (&ge; 75)</option>
            <option value="high">High (&ge; 50)</option>
            <option value="medium">Medium (&ge; 25)</option>
            <option value="low">Low (&lt; 25)</option>
          </Select>
        </div>

        {/* Agent filter */}
        {availableAgents.length > 0 && (
          <div className="w-full sm:w-40">
            <Select
              value={filters.agentId || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  agentId: e.target.value,
                })
              }
              className="h-9 bg-background/50 border-border/80 text-xs"
            >
              <option value="">All Agents</option>
              {availableAgents.map((ag) => (
                <option key={ag} value={ag}>
                  {ag}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 shrink-0"
            title="Reset filters"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
