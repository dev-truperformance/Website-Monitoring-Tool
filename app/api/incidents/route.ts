import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/drizzle'
import { users, monitors, incidents } from '@/drizzle/schema'
import { eq, sql } from 'drizzle-orm'

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

    const { monitorId, url, status, responseTime, error, timestamp, owner, organization, interval } = await request.json()

    if (!monitorId || !url || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create incident record
    const incidentData = await db.insert(incidents).values({
      monitorId,
      startedAt: new Date()
    }).returning();
    
    const incident = incidentData[0];

    // Update monitor status and last check time
    await db.update(monitors)
      .set({ 
        status: 'down',
        lastCheckAt: new Date()
      })
      .where(eq(monitors.id, monitorId));

    console.log(`🚨 Incident created for ${url}: ${error}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Incident created successfully',
      incidentId: incident.id
    })

  } catch (error) {
    console.error('Error creating incident:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
