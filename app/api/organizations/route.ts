import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/drizzle';
import { organizations, organizationMembers, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organizations from Clerk
    const clerk = await clerkClient();
    const clerkOrgs = await clerk.organizations.getOrganizationList({});

    // Get user from our database
    let dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      // Create user if doesn't exist
      await db.insert(users).values({
        clerkId: userId,
        email: '', // Will be updated later
        name: null,
        avatar: null,
      });
      
      // Fetch the newly created user
      dbUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });
    }

    // Sync organizations from Clerk to our database
    const syncedOrgs = [];
    for (const clerkOrg of clerkOrgs.data) {
      // Get memberships for this organization
      const memberships = await clerk.organizations.getOrganizationMembershipList({
        organizationId: clerkOrg.id,
      });
      
      // Check if organization already exists in our DB
      const existingOrg = await db.query.organizations.findFirst({
        where: eq(organizations.clerkOrganizationId, clerkOrg.id),
      });

      if (!existingOrg) {
        // Create organization in our DB
        const newOrg = await db.insert(organizations).values({
          clerkOrganizationId: clerkOrg.id,
          name: clerkOrg.name,
          slug: clerkOrg.slug || '',
          type: 'personal',
          plan: 'free',
          maxMonitors: 5,
        }).returning();

        // Find user's membership in this organization
        const userMembership = memberships.data.find((m: any) => m.publicUserData?.userId === userId);
        
        // Add membership record
        await db.insert(organizationMembers).values({
          organizationId: newOrg[0].id,
          userId: dbUser!.id,
          clerkMembershipId: userMembership?.id || `temp-${userId}-${clerkOrg.id}`,
          role: userMembership?.role || 'owner',
        });

        syncedOrgs.push({
          id: newOrg[0].id,
          clerkOrganizationId: clerkOrg.id,
          name: clerkOrg.name,
          slug: clerkOrg.slug || '',
          type: 'personal',
          plan: 'free',
          maxMonitors: 5,
          createdAt: newOrg[0].createdAt,
          updatedAt: newOrg[0].updatedAt,
        });
      } else {
        // Organization already exists, find user's membership
        const userMembership = memberships.data.find(m => m.publicUserData?.userId === userId);
        
        // Add membership record if not already exists
        try {
          await db.insert(organizationMembers).values({
            organizationId: existingOrg.id,
            userId: dbUser!.id,
            clerkMembershipId: userMembership?.id || `temp-${userId}-${clerkOrg.id}`,
            role: userMembership?.role || 'owner',
          });
        } catch (error) {
          // Membership already exists, ignore error
          console.log('Membership already exists for user in organization:', clerkOrg.id);
        }

        syncedOrgs.push({
          id: existingOrg.id,
          clerkOrganizationId: clerkOrg.id,
          name: existingOrg.name,
          slug: existingOrg.slug || '',
          type: 'personal',
          plan: 'free',
          maxMonitors: 5,
          createdAt: existingOrg.createdAt,
          updatedAt: existingOrg.updatedAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      organizations: syncedOrgs,
    });

  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    // Create organization in Clerk with createdBy
    const clerk = await clerkClient();
    const clerkOrg = await clerk.organizations.createOrganization({
      name,
      createdBy: userId,
    });
    console.log('--------> Clerk org created: <-------------', clerkOrg);
    // Find user in your DB
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Save organization in your DB
    const [newOrg] = await db.insert(organizations).values({
      clerkOrganizationId: clerkOrg.id,
      name: clerkOrg.name,
      slug: clerkOrg.slug ?? '',
      type: type ?? 'personal',
      plan: type === 'enterprise' ? 'pro' : 'free',
      maxMonitors: 
        type === 'enterprise' ? 100 :
        type === 'team' ? 20 : 5,
    }).returning();

    // Clerk automatically creates membership, get it
    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId: clerkOrg.id,
    });
    
    const userMembership = memberships.data.find(
      (m: any) => m.publicUserData?.userId === userId
    );
    
    await db.insert(organizationMembers).values({
      organizationId: newOrg.id,
      userId: dbUser.id,
      clerkMembershipId: userMembership?.id ?? '',
      role: 'owner',
    });

    console.log('✅ Organization created successfully:', {
      clerkId: clerkOrg.id,
      dbId: newOrg.id,
      name: clerkOrg.name,
    });

    return NextResponse.json({
      success: true,
      organization: {
        id: newOrg.id,
        clerkOrganizationId: clerkOrg.id,
        name: clerkOrg.name,
        slug: clerkOrg.slug ?? '',
        type: type ?? 'personal',
        plan: type === 'enterprise' ? 'pro' : 'free',
        maxMonitors: 
          type === 'enterprise' ? 100 :
          type === 'team' ? 20 : 5,
        createdAt: newOrg.createdAt,
        updatedAt: newOrg.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create organization' },
      { status: 500 }
    );
  }
}
