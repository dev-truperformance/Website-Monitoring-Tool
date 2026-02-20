import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import monitoringService from '@/services/monitoringService'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { monitorId } = await request.json()

    if (!monitorId) {
      return NextResponse.json({ error: 'Monitor ID required' }, { status: 400 })
    }

    // Stop monitoring for specific monitor
    await monitoringService.removeMonitor(monitorId);

    const status = monitoringService.getStatus();

    return NextResponse.json({ 
      success: true, 
      message: 'Monitor stopped',
      monitorId,
      status
    })

  } catch (error) {
    console.error('Error stopping monitor:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
