import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { DrizzleUserService } from '@/lib/drizzle-user-service'

export async function POST(request: NextRequest) {
  console.log("🚀 POST /api/user/sync called");
  
  try {
    const clerkUser = await currentUser()
    console.log("👤 Clerk user from API:", clerkUser?.id);
    
    if (!clerkUser) {
      console.log("❌ No clerk user found");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await DrizzleUserService.syncUserFromClerk(clerkUser)
    console.log("💾 User synced to PostgreSQL:", user.id);
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        fullName: user.name,
        imageUrl: user.avatar
      }
    })
  } catch (error) {
    console.error('❌ Error syncing user:', error)
    return NextResponse.json({ 
      error: 'Failed to sync user data' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await DrizzleUserService.getUserByClerkId(clerkUser.id)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      user: {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        fullName: user.name,
        imageUrl: user.avatar,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user data' 
    }, { status: 500 })
  }
}
