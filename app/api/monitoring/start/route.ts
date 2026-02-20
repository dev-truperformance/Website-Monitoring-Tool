import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import monitoringService from '@/services/monitoringService'
import { db } from '@/lib/drizzle'
import { users, monitors, organizationMembers } from '@/drizzle/schema'
import { eq, inArray } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const userData = await db.select().from(users).where(eq(users.clerkId, clerkUser.id)).limit(1)
    
    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = userData[0]

    // Get user's organizations
    const userOrgs = await db
      .select({
        organizationId: organizationMembers.organizationId,
      })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))

    if (!userOrgs || userOrgs.length === 0) {
      return NextResponse.json({ error: 'No organizations found' }, { status: 404 })
    }

    // Get all monitors for user's organizations
    const orgIds = userOrgs.map(org => org.organizationId)
    const monitorsData = await db.select().from(monitors)
      .where(inArray(monitors.organizationId, orgIds))

    // Transform database monitors to Monitor interface format
    const transformedMonitors = monitorsData.map(monitor => ({
      id: monitor.id.toString(),
      organizationId: monitor.organizationId.toString(),
      createdBy: monitor.createdBy?.toString() || undefined,
      name: monitor.name,
      url: monitor.url,
      intervalSeconds: monitor.intervalSeconds,
      timeoutSeconds: monitor.timeoutSeconds,
      isActive: monitor.isActive || undefined,
      status: monitor.status as 'up' | 'down',
      uptimePercentage: monitor.uptimePercentage || undefined,
      lastCheckAt: monitor.lastCheckAt,
      responseTimeMs: monitor.responseTimeMs || undefined,
      createdAt: monitor.createdAt,
      updatedAt: monitor.updatedAt,
      interval: `${monitor.intervalSeconds}s` // Add interval string for parsing
    }));

    console.log(`🚀 Starting monitoring for ${transformedMonitors.length} monitors`)

    // Start the server monitoring service with user's monitors
    await monitoringService.startAll(transformedMonitors);

    const status = monitoringService.getStatus();

    return NextResponse.json({ 
      success: true, 
      message: 'Server monitoring started',
      status
    })

  } catch (error) {
    console.error('Error starting server monitoring:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = monitoringService.getStatus();

    return NextResponse.json({ 
      success: true, 
      status
    })

  } catch (error) {
    console.error('Error getting monitoring status:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
