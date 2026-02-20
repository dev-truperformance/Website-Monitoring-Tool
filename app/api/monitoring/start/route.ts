import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import monitoringService from '@/services/monitoringService'

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Start the server monitoring service
    await monitoringService.startAll([]);

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
