import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import monitoringService from '@/services/monitoringService'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { monitor } = await request.json()

    if (!monitor) {
      return NextResponse.json({ error: 'Monitor data required' }, { status: 400 })
    }

    // Add new monitor to existing monitoring service
    monitoringService.addMonitor(monitor);

    const status = monitoringService.getStatus();

    return NextResponse.json({ 
      success: true, 
      message: 'Monitor added to monitoring',
      monitor: monitor.url,
      status
    })

  } catch (error) {
    console.error('Error adding monitor to monitoring:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
