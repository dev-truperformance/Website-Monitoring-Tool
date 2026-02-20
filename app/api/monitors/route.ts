import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { users, monitors, organizationMembers, organizations } from '@/drizzle/schema'
import { eq, and, inArray } from 'drizzle-orm'

// Convert interval string to seconds
function convertIntervalToSeconds(interval: string): number {
  const intervalMap: Record<string, number> = {
    '30 sec': 30,
    '1 min': 60,
    '5 min': 300,
    '10 min': 600,
    '30 min': 1800,
    '1 hr': 3600,
  };
  return intervalMap[interval] || 300; // Default to 5 minutes
}

interface Monitor {
  id: string
  organizationId: string
  createdBy: string
  name: string
  url: string
  status: 'up' | 'down'
  intervalSeconds: number
  timeoutSeconds: number
  isActive: boolean
  uptimePercentage: number
  lastCheckAt: Date
  responseTimeMs: number
  createdAt: Date
  updatedAt: Date
}

interface DrizzleMonitor {
  id: string
  organizationId: string
  createdBy: string | null
  name: string
  url: string
  intervalSeconds: number
  timeoutSeconds: number
  isActive: boolean | null
  status: string
  uptimePercentage: number | null
  lastCheckAt: Date
  responseTimeMs: number | null
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

    // Get user's organizations
    const userOrgs = await db
      .select({
        organizationId: organizationMembers.organizationId,
      })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user[0].id))

    console.log('🔍 User organizations from DB:', userOrgs)

    if (!userOrgs || userOrgs.length === 0) {
      console.log('❌ No organizations found for user')
      return NextResponse.json({ success: true, monitors: [] })
    }

    // Fetch monitors for user's organizations
    const orgIds = userOrgs.map(org => org.organizationId)
    console.log('🏢 Organization IDs to query:', orgIds)
    
    const monitorsData = await db
      .select({
        id: monitors.id,
        organizationId: monitors.organizationId,
        createdBy: monitors.createdBy,
        name: monitors.name,
        url: monitors.url,
        intervalSeconds: monitors.intervalSeconds,
        timeoutSeconds: monitors.timeoutSeconds,
        isActive: monitors.isActive,
        status: monitors.status,
        uptimePercentage: monitors.uptimePercentage,
        lastCheckAt: monitors.lastCheckAt,
        responseTimeMs: monitors.responseTimeMs,
        createdAt: monitors.createdAt,
        updatedAt: monitors.updatedAt,
        organizationName: organizations.name, // Include organization name
      })
      .from(monitors)
      .leftJoin(organizations, eq(monitors.organizationId, organizations.id))
      .where(inArray(monitors.organizationId, orgIds)) // Query for all user organizations
      .orderBy(monitors.createdAt)

    console.log('📊 Monitors found:', monitorsData)

    return NextResponse.json({ 
      success: true, 
      monitors: monitorsData.map((monitor: any) => ({
        id: monitor.id,
        organizationId: monitor.organizationId,
        createdBy: monitor.createdBy,
        name: monitor.name,
        url: monitor.url,
        status: monitor.status as 'up' | 'down',
        intervalSeconds: monitor.intervalSeconds,
        timeoutSeconds: monitor.timeoutSeconds,
        isActive: monitor.isActive,
        uptimePercentage: monitor.uptimePercentage,
        lastCheckAt: monitor.lastCheckAt,
        responseTimeMs: monitor.responseTimeMs,
        createdAt: monitor.createdAt,
        updatedAt: monitor.updatedAt,
        organizationName: monitor.organizationName, // Include organization name
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
    const { url, name, organizationId, interval } = body

    if (!url) {
      return NextResponse.json({ 
        error: 'URL is required' 
      }, { status: 400 })
    }

    // Convert interval string to seconds
    const intervalSeconds = convertIntervalToSeconds(interval)

    // Get user's organizations if organizationId not provided
    let targetOrganizationId = organizationId
    if (!targetOrganizationId) {
      const userOrgs = await db
        .select({
          organizationId: organizationMembers.organizationId,
        })
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, user.id))

      if (!userOrgs || userOrgs.length === 0) {
        return NextResponse.json({ 
          error: 'User must belong to an organization to create monitors' 
        }, { status: 403 })
      }

      targetOrganizationId = userOrgs[0].organizationId
    }

    const newMonitor = await db.insert(monitors).values({
      organizationId: targetOrganizationId,
      createdBy: user.id,
      name: name || 'Untitled Monitor',
      url,
      intervalSeconds,
      timeoutSeconds: 10,
      isActive: true,
      status: 'up',
      uptimePercentage: 100,
      lastCheckAt: new Date(),
      responseTimeMs: 0,
    }).returning();
    
    const monitor = newMonitor[0];

    return NextResponse.json({ 
      success: true, 
      monitor: {
        id: monitor.id,
        organizationId: monitor.organizationId,
        createdBy: monitor.createdBy,
        name: monitor.name,
        url: monitor.url,
        status: monitor.status as 'up' | 'down',
        intervalSeconds: monitor.intervalSeconds,
        timeoutSeconds: monitor.timeoutSeconds,
        isActive: monitor.isActive,
        uptimePercentage: monitor.uptimePercentage,
        lastCheckAt: monitor.lastCheckAt,
        responseTimeMs: monitor.responseTimeMs,
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

    // Get user's organizations to verify access
    const userOrgs = await db
      .select({
        organizationId: organizationMembers.organizationId,
      })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))

    console.log('🔍 User organizations for DELETE:', userOrgs)

    if (!userOrgs || userOrgs.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get the monitor and verify it belongs to user's organization
    const orgIds = userOrgs.map(org => org.organizationId)
    console.log('🏢 Checking monitor in organizations:', orgIds)
    
    const monitorData = await db.select().from(monitors)
      .where(and(
        eq(monitors.id, monitorId),
        inArray(monitors.organizationId, orgIds)
      ))
      .limit(1);

    console.log('📊 Monitor found for deletion:', monitorData)

    if (!monitorData || monitorData.length === 0) {
      return NextResponse.json({ 
        error: 'Monitor not found or access denied' 
      }, { status: 404 })
    }

    // Delete monitor
    const result = await db.delete(monitors).where(eq(monitors.id, monitorId)).returning();

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
