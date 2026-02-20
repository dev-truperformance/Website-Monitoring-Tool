export interface Monitor {
  _id?: string;
  id?: string;
  organizationId: string;
  createdBy?: string;
  name: string;
  url: string;
  intervalSeconds: number;
  timeoutSeconds: number;
  isActive?: boolean;
  status: 'up' | 'down';
  uptimePercentage?: number;
  lastCheckAt: Date;
  responseTimeMs?: number;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Legacy fields for compatibility
  userId?: string;
  uptime?: string;
  lastCheck?: string;
  responseTime?: string;
  incidents?: number;
  interval?: string;
  owner?: string;
  organization?: string;
}
