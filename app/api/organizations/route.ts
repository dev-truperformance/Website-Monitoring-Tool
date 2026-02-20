import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/drizzle';
import { organizations, users, organizationMembers } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('No userId found in auth:', userId);
      return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
    }

    const { name, type } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Organization name and type are required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    console.log('Creating organization for user:', userId);

    // Check if user exists in our database
    let user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    
    if (user.length === 0) {
      // Create user in our database without Clerk API call for now
      const newUser = await db.insert(users).values({
        clerkId: userId,
        email: '', // Will be updated later
        name: null,
        avatar: null,
      }).returning();
      
      user = newUser;
      console.log('Created new user in database:', user[0]);
    }

    // Create organization in our database first (simplified approach)
    const organization = await db.insert(organizations).values({
      clerkOrganizationId: `org_${Date.now()}`, // Temporary ID
      name,
      slug,
      plan: type === 'enterprise' ? 'pro' : 'free',
      maxMonitors: type === 'enterprise' ? 100 : type === 'team' ? 20 : 5,
    }).returning();

    // Add user as owner in our database
    await db.insert(organizationMembers).values({
      organizationId: organization[0].id,
      userId: user[0].id,
      clerkMembershipId: `membership_${Date.now()}`, // Temporary ID
      role: 'owner',
    });

    console.log('Organization created successfully:', organization[0]);

    return NextResponse.json({
      success: true,
      organization: organization[0],
    });

  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create organization' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from our database
    const user = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's organizations
    const userOrgs = await db
      .select({
        organization: organizations,
        membership: organizationMembers,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, user[0].id));

    return NextResponse.json({
      organizations: userOrgs.map(org => ({
        ...org.organization,
        role: org.membership.role,
      })),
    });

  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
