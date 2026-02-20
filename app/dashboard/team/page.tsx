"use client"

import { DashboardSidebar } from "@/components/DashboardSidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function TeamPage() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <h1 className="text-2xl font-semibold">Team Members</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
