"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function SignInPage() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    console.log("🔍 SignInPage useEffect triggered:", { isSignedIn, user: !!user });
    
    if (isSignedIn && user) {
      console.log("✅ User successfully signed in:", {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        fullName: user.fullName,
        timestamp: new Date().toISOString()
      });

      // Sync user data to database
      syncUserToDatabase(user);
    }
  }, [isSignedIn, user]);

  const syncUserToDatabase = async (clerkUser: any) => {
    console.log("🔄 Starting database sync for user:", clerkUser.id);
    
    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("📡 Sync API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ User synced to database:", data);
      } else {
        const errorData = await response.text();
        console.error("❌ Failed to sync user to database:", response.status, errorData);
      }
    } catch (error) {
      console.error("❌ Error syncing user to database:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignIn 
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg"
          }
        }}
      />
    </div>
  );
}
