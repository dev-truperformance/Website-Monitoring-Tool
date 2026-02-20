import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { DrizzleUserService } from '@/lib/drizzle-user-service'
import { db } from '@/lib/drizzle'
import { users, monitors } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
    try {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dbUser = await DrizzleUserService.getUserByClerkId(clerkUser.id)

        // 1. Delete all monitors belonging to this user
        if (dbUser) {
            await db.delete(monitors).where(eq(monitors.userId, dbUser.id))
        }

        // 2. Delete user from database
        await DrizzleUserService.deleteUser(clerkUser.id)

        // 3. Delete user from Clerk
        const clerk = await clerkClient()
        await clerk.users.deleteUser(clerkUser.id)

        return NextResponse.json({ success: true, message: 'Account deleted successfully' })
    } catch (error) {
        console.error('Error deleting account:', error)
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
}
