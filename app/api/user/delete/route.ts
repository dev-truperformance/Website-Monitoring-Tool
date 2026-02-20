import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { DrizzleUserService } from '@/lib/drizzle-user-service'
import { db } from '@/lib/drizzle'
import { users, monitors, organizationMembers } from '@/drizzle/schema'
import { eq, inArray } from 'drizzle-orm'

export async function DELETE(request: NextRequest) {
    try {
        const clerkUser = await currentUser()

        if (!clerkUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dbUser = await DrizzleUserService.getUserByClerkId(clerkUser.id)

        // 1. Delete all monitors belonging to this user through organizations
        if (dbUser) {
            // Get user's organizations
            const userOrgMemberships = await db.select({ organizationId: organizationMembers.organizationId })
                .from(organizationMembers)
                .where(eq(organizationMembers.userId, dbUser.id))
            
            const organizationIds = userOrgMemberships.map(m => m.organizationId)
            
            // Delete monitors in those organizations
            if (organizationIds.length > 0) {
                await db.delete(monitors).where(inArray(monitors.organizationId, organizationIds))
            }
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
