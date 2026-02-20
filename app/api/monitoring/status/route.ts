import { NextRequest, NextResponse } from 'next/server'
import monitoringService from '@/services/monitoringService'

export async function GET(request: NextRequest) {
  try {
    // Add a small delay to ensure any pending operations complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const status = monitoringService.getStatus();

    return NextResponse.json({ 
      success: true, 
      message: 'Monitoring status retrieved',
      status
    })

  } catch (error) {
    console.error('Error getting monitoring status:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
