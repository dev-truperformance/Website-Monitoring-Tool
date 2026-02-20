import { Clock, MoreHorizontal, Triangle, Eye, Trash2, Play, Pause } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from '@/utils/dateUtils';

interface Monitor {
  id: string;
  url: string;
  status: 'up' | 'down' | 'paused';
  uptime: string;
  lastCheck: string;
  responseTime: string;
  incidents: number;
  interval: string;
  owner?: string;
  organization?: string;
  isMonitoringActive?: boolean;
}

interface MonitorCardProps {
  monitor: Monitor;
  onDelete: (id: string) => void;
  onViewDetails: (monitor: Monitor) => void;
  onStartMonitor: (id: string) => void;
  onStopMonitor: (id: string) => void;
  isMonitoringActive?: boolean; // Track if this monitor is actively being monitored
}

export default function MonitorCard({ monitor, onDelete, onViewDetails, onStartMonitor, onStopMonitor, isMonitoringActive }: MonitorCardProps) {
  return (
    <div className=" rounded-xl border border-gray-800">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              monitor.status === 'up' ? 'bg-green-500' : 
              monitor.status === 'down' ? 'bg-red-500' : 
              'bg-yellow-500'
            }`}>
              {monitor.status === 'up' && <Triangle className="w-4 h-4 text-white fill-white" />}
              {monitor.status === 'down' && <Triangle className="w-4 h-4 text-white fill-white rotate-180" />}
              {monitor.status === 'paused' && <Pause className="w-4 h-4 text-white" />}
            </div>
            <div>
              <div className="dark:text-white font-semibold text-lg">{monitor.url}</div>
              <div className={`text-sm ${
                monitor.status === 'up' ? 'text-green-400' : 
                monitor.status === 'down' ? 'text-red-400' : 
                'text-yellow-400'
              }`}>
                {monitor.status === 'up' && `Up ${monitor.uptime}`}
                {monitor.status === 'down' && `Down ${monitor.uptime}`}
                {monitor.status === 'paused' && `Paused ${monitor.uptime}`}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Last check: {formatDate(monitor.lastCheck)}
              </div>
              {(monitor.owner || monitor.organization) && (
                <div className="text-gray-400 text-xs mt-1">
                  {monitor.owner && <span>Owner: {monitor.owner}</span>}
                  {monitor.owner && monitor.organization && <span> • </span>}
                  {monitor.organization && <span>Org: {monitor.organization}</span>}
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(monitor)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {isMonitoringActive ? (
                <DropdownMenuItem onClick={() => onStopMonitor(monitor.id)}>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Monitor
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onStartMonitor(monitor.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Monitor
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(monitor.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className='flex flex-row gap-3'>
            <div className="flex items-center text-gray-400 text-sm ml-10">
              <Clock className="w-4 h-4 mr-2" />
              <span>{monitor.interval}</span>
            </div>
            <div className="flex items-center text-gray-400 text-sm ml-10">
              <Clock className="w-4 h-4 mr-2" />
              <span>{monitor.url}</span>
            </div>
          </div>
          <div className="text-green-400 text-sm font-semibold">100%</div>
        </div>
      </div>
    </div>
  );
}
