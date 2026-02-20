import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { users, monitors, statusReports } from '@/drizzle/schema'
import { eq, and, inArray } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { monitorId, url, status, responseTime, error, timestamp, checkedAt } = await request.json()

    if (!monitorId || !url || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the monitor to verify it exists and get the user ID
    const monitorData = await db.select().from(monitors).where(eq(monitors.id, parseInt(monitorId))).limit(1)

    if (!monitorData || monitorData.length === 0) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }

    const monitor = monitorData[0]

    // Create status report record
    const statusReportData = await db.insert(statusReports).values({
      monitorId: parseInt(monitorId),
      url,
      status,
      responseTime,
      error,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      checkedAt: checkedAt ? new Date(checkedAt) : new Date()
    }).returning();

    const statusReport = statusReportData[0];

    // Update monitor's last check and status
    await db.update(monitors)
      .set({
        status,
        lastCheck: new Date(),
        responseTime: `${responseTime}ms`,
        updatedAt: new Date()
      })
      .where(eq(monitors.id, parseInt(monitorId)));

    console.log(`📊 Status report created for ${url}: ${status} (${responseTime}ms)`)

    return NextResponse.json({ 
      success: true, 
      message: 'Status report created successfully',
      statusReportId: statusReport.id
    })

  } catch (error) {
    console.error('Error creating status report:', error)
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

    // Get user from database
    const userData = await db.select().from(users).where(eq(users.clerkId, clerkUser.id)).limit(1)
    
    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = userData[0]

    const { searchParams } = new URL(request.url)
    const monitorId = searchParams.get('monitorId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause - filter by user's monitors
    const userMonitors = await db.select({ id: monitors.id }).from(monitors).where(eq(monitors.userId, user.id))
    const monitorIds = userMonitors.map(m => m.id)
    
    let whereCondition = inArray(statusReports.monitorId, monitorIds)
    if (monitorId) {
      whereCondition = eq(statusReports.monitorId, parseInt(monitorId))
    }

    // Fetch status reports
    const statusReportsData = await db.select().from(statusReports)
      .where(whereCondition)
      .orderBy(statusReports.timestamp)
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const totalCountData = await db.select({ count: statusReports.id }).from(statusReports).where(whereCondition)
    const totalCount = totalCountData.length

    return NextResponse.json({ 
      success: true, 
      statusReports: statusReportsData.map(report => ({
        ...report,
        monitor: {
          url: report.url,
          interval: '5 min' // Default interval since we don't have monitor join
        }
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching status reports:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch status reports' 
    }, { status: 500 })
  }
}
