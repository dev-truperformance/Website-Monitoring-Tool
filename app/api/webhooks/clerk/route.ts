import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { Webhook } from 'svix'
import { UserService } from '@/lib/user-service'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const headersList = request.headers
    const svix_id = headersList.get('svix-id')
    const svix_timestamp = headersList.get('svix-timestamp')
    const svix_signature = headersList.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
    }

    // Verify webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
    let evt: any

    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      })
    } catch (err) {
      console.error('Webhook verification failed:', err)
      return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
    }

    const { type } = evt.data

    switch (type) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      default:
        console.log(`Unhandled event type: ${type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleUserCreated(data: any) {
  try {
    console.log('User created:', data.id)
    await UserService.syncUserFromClerk(data)
  } catch (error) {
    console.error('Error handling user created:', error)
  }
}

async function handleUserUpdated(data: any) {
  try {
    console.log('User updated:', data.id)
    await UserService.syncUserFromClerk(data)
  } catch (error) {
    console.error('Error handling user updated:', error)
  }
}

async function handleUserDeleted(data: any) {
  try {
    console.log('User deleted:', data.id)
    await UserService.deleteUser(data.id)
  } catch (error) {
    console.error('Error handling user deleted:', error)
  }
}
