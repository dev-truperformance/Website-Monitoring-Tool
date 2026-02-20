import { useState } from 'react';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';

interface MonitorControlsProps {
  onAddMonitor: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function MonitorControls({ onAddMonitor, searchTerm, onSearchChange }: MonitorControlsProps) {
  return (
    <div className="bg-card px-8 py-4 border-b">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background transition-all duration-200"
            placeholder="Search monitors..."
          />
        </div>
        <button className="flex items-center px-4 py-3 border rounded-lg text-sm text-foreground hover:bg-accent transition-all duration-200 shadow-sm">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
        <button className="flex items-center px-4 py-3 border rounded-lg text-sm text-foreground hover:bg-accent transition-all duration-200 shadow-sm">
          Down first
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
