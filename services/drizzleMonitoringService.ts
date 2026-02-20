import { db } from '@/lib/drizzle'
import { statusReports, incidents, monitors, monitorChecks } from '@/drizzle/schema'
import { eq, sql } from 'drizzle-orm'

interface MonitoringResult {
  url: string;
  status: 'up' | 'down';
  responseTime: number;
  error?: string;
}

class DrizzleMonitoringService {
  private isRunning = false;

  // Create status report for every check (using new monitor_checks table)
  async createStatusReport(monitorId: string, url: string, status: 'up' | 'down', responseTime: number, error?: string, statusCode?: number) {
    try {
      console.log(`📊 Creating status report for monitor ${monitorId}: ${status} (${responseTime}ms)`);
      
      const result = await db.insert(monitorChecks).values({
        monitorId,
        status: status === 'up',
        responseTimeMs: responseTime,
        errorType: error,
        statusCode: statusCode || null,
        checkedAt: new Date()
      }).returning();

      console.log(`✅ Status report created successfully:`, result[0]);
      console.log(`📊 Status report created for ${url}: ${status} (${responseTime}ms)`);
    } catch (error) {
      console.error('❌ Error creating status report:', error);
      console.error('Monitor ID:', monitorId);
      console.error('Status:', status);
      console.error('Response Time:', responseTime);
      console.error('Error:', error);
    }
  }

  // Create incident when monitor goes down
  async createIncident(monitorId: string, url: string, responseTime: number, error?: string) {
    try {
      // Get monitor to find user ID
      const monitor = await db.select().from(monitors).where(eq(monitors.id, monitorId)).limit(1);
      
      if (monitor.length === 0) {
        console.error('Monitor not found:', monitorId);
        return;
      }

      await db.insert(incidents).values({
        monitorId,
        startedAt: new Date()
      });

      // Update monitor status
      await db.update(monitors)
        .set({ 
          status: 'down',
          lastCheckAt: new Date()
        })
        .where(eq(monitors.id, monitorId));

      console.log(`🚨 Incident created for ${url}: ${error}`);
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  }

  // Get monitor by ID
  async getMonitorById(monitorId: string) {
    try {
      const monitor = await db.select().from(monitors).where(eq(monitors.id, monitorId)).limit(1);
      return monitor[0] || null;
    } catch (error) {
      console.error('Error fetching monitor by ID:', error);
      return null;
    }
  }

  // Update monitor status
  async updateMonitorStatus(monitorId: string, status: 'up' | 'down', responseTime: number) {
    try {
      await db.update(monitors)
        .set({ 
          status,
          lastCheckAt: new Date(),
          responseTimeMs: responseTime,
          updatedAt: new Date()
        })
        .where(eq(monitors.id, monitorId));
    } catch (error) {
      console.error('Error updating monitor status:', error);
    }
  }

  // Calculate uptime percentage for a monitor (efficient calculation)
  async calculateUptimePercentage(monitorId: string, days: number = 30): Promise<number> {
    try {
      const result = await db
        .select({
          uptime: sql<number>`
            100.0 * 
            SUM(CASE WHEN status = true THEN 1 ELSE 0 END) 
            / COUNT(*)
          `
        })
        .from(monitorChecks)
        .where(eq(monitorChecks.monitorId, monitorId))
        .limit(1);
      
      return result[0]?.uptime || 100;
    } catch (error) {
      console.error('Error calculating uptime:', error);
      return 100;
    }
  }

  // Update uptime percentage for a monitor
  async updateUptimePercentage(monitorId: string) {
    try {
      const uptimePercentage = await this.calculateUptimePercentage(monitorId);
      
      await db.update(monitors)
        .set({ 
          uptimePercentage,
          updatedAt: new Date()
        })
        .where(eq(monitors.id, monitorId));
        
      console.log(`📈 Updated uptime for monitor ${monitorId}: ${uptimePercentage.toFixed(2)}%`);
    } catch (error) {
      console.error('Error updating uptime percentage:', error);
    }
  }

  // Get monitoring status
  getStatus() {
    return {
      isRunning: this.isRunning,
      message: 'Drizzle monitoring service active'
    };
  }
}

// Singleton instance
export const drizzleMonitoringService = new DrizzleMonitoringService();
export default drizzleMonitoringService;
