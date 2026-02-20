import { useState } from 'react';
import { Clock, Zap } from 'lucide-react';

interface Monitor {
  id: number;
  url: string;
  name: string;
  status: 'up' | 'down';
  uptime: string;
  lastCheck: string;
  responseTime: string;
  incidents: number;
  interval?: string;
}

interface StatusPanelProps {
  monitors: Monitor[];
}

export default function StatusPanel({ monitors }: StatusPanelProps) {
  const upCount = monitors.filter(m => m.status === 'up').length;
  const downCount = monitors.filter(m => m.status === 'down').length;
  const pausedCount = 0; // No paused status in current schema

  return (
    <div className="w-80 bg-card border-l p-6 shadow-xl">
      {/* Current Status */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
          Current status
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-xl border border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              <span className="font-semibold text-red-800 dark:text-red-200">Down</span>
            </div>
            <span className="text-3xl font-bold text-red-600 dark:text-red-400">{downCount}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span className="font-semibold text-green-800 dark:text-green-200">Up</span>
            </div>
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">{upCount}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl border hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-muted-foreground rounded-full mr-3"></div>
              <span className="font-semibold text-foreground">Paused</span>
            </div>
            <span className="text-3xl font-bold text-muted-foreground">{pausedCount}</span>
          </div>
        </div>
        
        {/* Circular Status Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="relative w-36 h-36">
            <div className="absolute inset-0 rounded-full border-8 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-lg"></div>
            <div className="absolute inset-3 rounded-full bg-card flex items-center justify-center shadow-inner">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 animate-pulse">
                  {upCount > 0 ? Math.round((upCount / monitors.length) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last 24 Hours */}
      <div className="bg-gradient-to-br from-muted/50 to-muted rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Last 24 hours
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-background rounded-lg border hover:shadow-md transition-all duration-200">
            <span className="text-muted-foreground text-sm">Overall uptime</span>
            <span className="font-bold text-green-600 dark:text-green-400 text-lg">
              {upCount > 0 ? '100.00%' : '0.00%'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-lg border hover:shadow-md transition-all duration-200">
            <span className="text-muted-foreground text-sm">Incidents</span>
            <span className="font-bold text-foreground text-lg">{downCount}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-lg border hover:shadow-md transition-all duration-200">
            <span className="text-muted-foreground text-sm">Without incid.</span>
            <span className="font-bold text-foreground text-lg">24h</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-lg border hover:shadow-md transition-all duration-200">
            <span className="text-muted-foreground text-sm">Affected mon.</span>
            <span className="font-bold text-foreground text-lg">{downCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
