import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import monitoringService from '@/services/monitoringService'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Stop all monitoring using monitoring service
    monitoringService.stopAll();

    const status = monitoringService.getStatus();

    return NextResponse.json({ 
      success: true, 
      message: 'All monitoring stopped',
      status
    })

  } catch (error) {
    console.error('Error stopping all monitoring:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
