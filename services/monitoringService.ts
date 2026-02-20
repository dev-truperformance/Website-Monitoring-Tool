import { Monitor } from '@/types/monitor';
import { drizzleMonitoringService } from './drizzleMonitoringService';

interface MonitoringResult {
  url: string;
  status: 'up' | 'down';
  responseTime: number;
  error?: string;
}

class MonitoringService {
  private monitors: Map<string, Monitor> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;
  private checkQueue: Promise<MonitoringResult>[] = [];
  private isProcessingQueue = false;
  private lastStatuses: Map<string, 'up' | 'down'> = new Map();

  // Add or update a monitor
  addMonitor(monitor: Monitor) {
    this.monitors.set(monitor.id!, monitor);
    
    // If already running, update this monitor's interval
    if (this.isRunning) {
      this.startMonitoring(monitor);
    }
  }

  // Remove a monitor
  removeMonitor(monitorId: string) {
    // Clear interval for this monitor
    const interval = this.intervals.get(monitorId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(monitorId);
    }
    
    // Remove from monitors list
    this.monitors.delete(monitorId);
  }

  // Start monitoring all monitors
  async startAll(monitors: Monitor[]) {
    console.log('🚀 Starting monitoring for', monitors.length, 'monitors');
    
    // Clear existing intervals
    this.stopAll();
    
    // Add all monitors
    monitors.forEach(monitor => {
      this.monitors.set(monitor.id!, monitor);
    });
    
    // Start monitoring for each
    for (const monitor of monitors) {
      this.startMonitoring(monitor);
    }
    
    this.isRunning = true;
  }

  // Stop all monitoring
  stopAll() {
    console.log('🛑 Stopping all monitoring');
    
    // Clear all intervals
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    
    this.isRunning = false;
  }

  // Start monitoring for a single monitor by ID
  async startMonitor(monitorId: string) {
    try {
      // Fetch monitor from database
      const monitorData = await drizzleMonitoringService.getMonitorById(monitorId);
      if (!monitorData) {
        throw new Error(`Monitor with ID ${monitorId} not found`);
      }

      // Convert to Monitor type
      const monitor: Monitor = {
        id: monitorData.id.toString(),
        organizationId: monitorData.organizationId.toString(),
        createdBy: monitorData.createdBy?.toString(),
        name: monitorData.name,
        url: monitorData.url,
        intervalSeconds: monitorData.intervalSeconds,
        timeoutSeconds: monitorData.timeoutSeconds,
        isActive: monitorData.isActive || undefined,
        status: monitorData.status as 'up' | 'down',
        uptimePercentage: monitorData.uptimePercentage || undefined,
        lastCheckAt: monitorData.lastCheckAt,
        responseTimeMs: monitorData.responseTimeMs || undefined,
        createdAt: monitorData.createdAt,
        updatedAt: monitorData.updatedAt,
        
        // Legacy fields for compatibility
        userId: monitorData.createdBy?.toString(),
        uptime: monitorData.uptimePercentage?.toString() || '100%',
        lastCheck: monitorData.lastCheckAt.toISOString(),
        responseTime: monitorData.responseTimeMs?.toString() || '0',
        incidents: 0, // This would need to be calculated from incidents table
        interval: `${monitorData.intervalSeconds}s`,
        organization: monitorData.organizationId.toString()
      };

      // Add monitor to the list
      this.addMonitor(monitor);
      
      // Start monitoring for this specific monitor
      this.startMonitoring(monitor);
      
      console.log(`✅ Started monitoring for monitor ${monitorId}: ${monitor.url}`);
    } catch (error) {
      console.error(`Error starting monitor ${monitorId}:`, error);
      throw error;
    }
  }

  // Start monitoring for a single monitor
  private startMonitoring(monitor: Monitor) {
    // Clear existing interval for this monitor
    const existingInterval = this.intervals.get(monitor.id!);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Parse interval string to milliseconds
    const intervalMs = this.parseIntervalToMs(monitor.interval || `${monitor.intervalSeconds}s`);
    
    console.log(`⏰ Starting monitoring for ${monitor.url} every ${monitor.interval} (${intervalMs}ms)`);

    // Start periodic checks
    const intervalId = setInterval(async () => {
      await this.checkMonitor(monitor);
    }, intervalMs);

    this.intervals.set(monitor.id!, intervalId);
    
    // Check immediately
    this.checkMonitor(monitor);
  }

  // Parse interval string to milliseconds
  private parseIntervalToMs(interval: string): number {
    if (!interval) return 5 * 60 * 1000;
    
    console.log(`⏰ Parsing interval: "${interval}"`);
    
    const match = interval.match(/(\d+)\s*(min|hr|hour|day|week|month|sec|s)/i);
    if (!match) return 5 * 60 * 1000;

    const [, num, unit] = match;
    const value = parseInt(num);
    const result = value * 1000; // Default to seconds

    switch (unit.toLowerCase()) {
      case 'sec':
      case 's':
        return value * 1000;
      case 'min':
        return value * 60 * 1000;
      case 'hr':
      case 'hour':
        return value * 60 * 60 * 1000;
      case 'day':
        return value * 24 * 60 * 60 * 1000;
      case 'week':
        return value * 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return value * 30 * 24 * 60 * 60 * 1000;
      default:
        return result;
    }
  }

  // Check a single monitor
  private async checkMonitor(monitor: Monitor) {
    const checkStartTime = Date.now();
    const monitorId = monitor.id!;
    let currentStatus: 'up' | 'down' = 'up';
    let responseTime = 0;
    let error: string | undefined;
    let response: Response | undefined;
    
    try {
      // Use fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      response = await fetch(monitor.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'TruWebMonitor/1.0'
        }
      });

      clearTimeout(timeoutId);
      responseTime = Date.now() - checkStartTime;

      // Check if status code is 200 (OK)
      if (response.status === 200) {
        currentStatus = 'up';
        console.log(`✅ ${monitor.url} - UP (${responseTime}ms) - Status: ${response.status}`);
      } else {
        currentStatus = 'down';
        error = `HTTP ${response.status} ${response.statusText}`;
        console.log(`❌ ${monitor.url} - DOWN (${response.status} ${response.statusText})`);
      }

    } catch (fetchError) {
      currentStatus = 'down';
      responseTime = Date.now() - checkStartTime;
      error = fetchError instanceof Error ? fetchError.message : 'Network error';
      console.log(`❌ ${monitor.url} - ERROR (${error})`);
    }

    // Push ALL status reports to PostgreSQL
    console.log(`📝 Calling createStatusReport with statusCode: ${response?.status}`);
    await this.createStatusReport(monitor, currentStatus, responseTime, error, response?.status);

    // Get last known status
    const lastStatus = this.lastStatuses.get(monitorId) || 'up';
    
    // Only create incident if status changed to down
    if (lastStatus === 'up' && currentStatus === 'down') {
      await this.createIncident(monitor, responseTime, error);
    }
    
    // Update last status tracking
    this.lastStatuses.set(monitorId, currentStatus);

    // Update uptime percentage periodically (every 10 checks to avoid too frequent updates)
    const totalChecks = this.lastStatuses.size || 1;
    if (totalChecks % 10 === 0) {
      await drizzleMonitoringService.updateUptimePercentage(monitorId);
    }
  }

  // Create status report for every check
  private async createStatusReport(monitor: Monitor, status: 'up' | 'down', responseTime: number, error?: string, statusCode?: number) {
    console.log(`📝 Calling createStatusReport for monitor ${monitor.id}: ${status}`);
    await drizzleMonitoringService.createStatusReport(monitor.id!, monitor.url, status, responseTime, error, statusCode);
  }

  // Create incident when monitor goes down
  private async createIncident(monitor: Monitor, responseTime: number, error?: string) {
    await drizzleMonitoringService.createIncident(monitor.id!, monitor.url, responseTime, error);
  }

  // Get monitoring status
  getStatus() {
    return {
      isRunning: this.isRunning,
      monitorCount: this.monitors.size,
      activeIntervals: this.intervals.size
    };
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();
export default monitoringService;
