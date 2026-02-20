import { db } from '@/lib/drizzle'
import { users } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export interface DrizzleUser {
  id: number;
  clerkId: string | null;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date | null;
  isActive: boolean | null;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  monitorsLimit: number | null;
  monitorsCount: number | null;
}

export class DrizzleUserService {
  static async createUser(userData: Omit<DrizzleUser, 'id' | 'createdAt' | 'updatedAt' | 'monitorsCount'>): Promise<DrizzleUser> {
    const result = await db.insert(users).values({
      clerkId: userData.clerkId,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      lastSignInAt: userData.lastSignInAt,
      isActive: userData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      monitorsLimit: 5,
      monitorsCount: 0
    }).returning();

    const user = result[0];
    return user!;
  }

  static async getUserByClerkId(clerkId: string): Promise<DrizzleUser | null> {
    const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    return user.length > 0 ? user[0] : null;
  }

  static async updateUser(clerkId: string, updateData: Partial<Omit<DrizzleUser, 'id' | 'clerkId' | 'createdAt'>>): Promise<DrizzleUser | null> {
    const result = await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(users.clerkId, clerkId))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  static async updateUserLastSignIn(clerkId: string): Promise<void> {
    await db.update(users)
      .set({ 
        lastSignInAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.clerkId, clerkId));
  }

  static async syncUserFromClerk(clerkUser: any): Promise<DrizzleUser> {
    const existingUser = await this.getUserByClerkId(clerkUser.id);
    
    if (existingUser) {
      // Update existing user
      const updateData: any = {
        email: clerkUser.primaryEmailAddress?.emailAddress || existingUser.email,
        name: clerkUser.fullName || existingUser.name,
        avatar: clerkUser.imageUrl || existingUser.avatar,
        lastSignInAt: new Date()
      };
      
      const updatedUser = await this.updateUser(clerkUser.id, updateData);
      return updatedUser!;
    } else {
      // Create new user
      return this.createUser({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        name: clerkUser.fullName || undefined,
        avatar: clerkUser.imageUrl || undefined,
        lastSignInAt: new Date(),
        isActive: true,
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        monitorsLimit: 5
      });
    }
  }

  static async deleteUser(clerkId: string): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.clerkId, clerkId));
      return true;
    } catch (error) {
      return false;
    }
  }
}
