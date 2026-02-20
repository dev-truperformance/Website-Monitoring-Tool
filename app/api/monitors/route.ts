import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { users, monitors } from '@/drizzle/schema'
import { eq, and } from 'drizzle-orm'

// Helper function to calculate uptime
function calculateUptime(createdAt: Date): string {
  const now = new Date();
  const diff = now.getTime() - createdAt.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}, ${hours % 24} hr`;
  } else if (hours > 0) {
    return `${hours} hr, ${minutes % 60} min`;
  } else {
    return `${minutes} min`;
  }
}

interface Monitor {
  id: string
  userId: string
  url: string
  status: 'up' | 'down'
  uptime: string
  lastCheck: Date
  responseTime: string
  incidents: number
  interval: string
  owner?: string
  organization?: string
  createdAt: Date
  updatedAt: Date
}

interface DrizzleMonitor {
  id: number
  userId: number | null
  url: string
  status: string
  uptime: string
  lastCheck: Date
  responseTime: string
  incidents: number
  interval: string
  owner?: string | null
  organization?: string | null
  createdAt: Date
  updatedAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await db.select().from(users).where(eq(users.clerkId, clerkUser.id)).limit(1)
    
    if (!user || user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch monitors for this user
    const monitorsData = await db.select().from(monitors).where(eq(monitors.userId, user[0].id)).orderBy(monitors.createdAt)

    // Calculate uptime for each monitor and update if needed
    const updatedMonitors = await Promise.all(monitorsData.map(async (monitor: DrizzleMonitor) => {
      const calculatedUptime = calculateUptime(monitor.createdAt);
      
      // Update uptime in database if it's different
      if (monitor.uptime !== calculatedUptime) {
        await db.update(monitors)
          .set({ 
            uptime: calculatedUptime,
            updatedAt: new Date()
          })
          .where(eq(monitors.id, monitor.id));
        monitor.uptime = calculatedUptime;
      }
      
      return monitor;
    }));

    return NextResponse.json({ 
      success: true, 
      monitors: updatedMonitors.map((monitor: DrizzleMonitor) => ({
        id: monitor.id,
        userId: monitor.userId,
        url: monitor.url,
        status: monitor.status,
        uptime: monitor.uptime,
        lastCheck: monitor.lastCheck.toISOString(),
        responseTime: monitor.responseTime,
        incidents: monitor.incidents,
        interval: monitor.interval,
        owner: monitor.owner,
        organization: monitor.organization,
        createdAt: monitor.createdAt,
        updatedAt: monitor.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching monitors:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch monitors' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userData = await db.select().from(users).where(eq(users.clerkId, clerkUser.id)).limit(1)
    
    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = userData[0]

    const body = await request.json()
    const { url, interval, organization } = body

    if (!url) {
      return NextResponse.json({ 
        error: 'URL is required' 
      }, { status: 400 })
    }

    const newMonitor = await db.insert(monitors).values({
      userId: user.id,
      url,
      status: 'up',
      uptime: '0 min',
      lastCheck: new Date(),
      responseTime: 'Checking...',
      incidents: 0,
      interval: interval || '5 min',
      owner: user.name || clerkUser.fullName || 'Unknown User',
      organization: organization || undefined
    }).returning();
    
    const monitor = newMonitor[0];

    return NextResponse.json({ 
      success: true, 
      monitor: {
        id: monitor.id,
        userId: monitor.userId,
        url: monitor.url,
        status: monitor.status,
        uptime: monitor.uptime,
        lastCheck: monitor.lastCheck.toISOString(),
        responseTime: monitor.responseTime,
        incidents: monitor.incidents,
        interval: monitor.interval,
        owner: monitor.owner,
        organization: monitor.organization,
        createdAt: monitor.createdAt,
        updatedAt: monitor.updatedAt
      }
    })
  } catch (error) {
    console.error('Error creating monitor:', error)
    return NextResponse.json({ 
      error: 'Failed to create monitor' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const monitorId = searchParams.get('id')

    if (!monitorId) {
      return NextResponse.json({ 
        error: 'Monitor ID is required' 
      }, { status: 400 })
    }

    const userData = await db.select().from(users).where(eq(users.clerkId, clerkUser.id)).limit(1)
    
    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = userData[0]

    // First get the monitor to ensure it belongs to this user
    const monitorData = await db.select().from(monitors)
      .where(and(
        eq(monitors.id, parseInt(monitorId!)),
        eq(monitors.userId, user.id!)
      ))
      .limit(1);

    if (!monitorData || monitorData.length === 0) {
      return NextResponse.json({ 
        error: 'Monitor not found or access denied' 
      }, { status: 404 })
    }

    // Delete the monitor
    const result = await db.delete(monitors).where(eq(monitors.id, parseInt(monitorId!))).returning();

    return NextResponse.json({ 
      success: true, 
      message: 'Monitor deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting monitor:', error)
    return NextResponse.json({ 
      error: 'Failed to delete monitor' 
    }, { status: 500 })
  }
}
