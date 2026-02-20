"use client"

import * as React from "react"
import Image from "next/image"
import {
  BookOpen,
  Bot,
  Frame,
  Settings2,
  SquareTerminal,
} from "lucide-react"
import { usePathname } from "next/navigation"

import { NavMain } from "./nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useUser } from "@clerk/nextjs"



export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()
  const { user } = useUser();
  const pathname = usePathname();

  const navItems = [
    {
      title: "Monitoring",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Incidents",
      url: "/dashboard/incidents",
      icon: Bot,
    },
    {
      title: "Status Page",
      url: "/dashboard/status",
      icon: BookOpen,
    },
    {
      title: "Team Members",
      url: "/dashboard/team",
      icon: Settings2,
    },
    {
      title: "Maintenance",
      url: "/dashboard/maintenance",
      icon: Frame,
    },
  ];

  const data = {
    user: {
      name: user?.fullName || "User",
      email: user?.primaryEmailAddress?.emailAddress || "user@example.com",
      avatar: user?.imageUrl || "/avatars/shadcn.svg",
    },
    navMain: navItems.map(item => ({
      ...item,
      isActive: pathname === item.url || (item.url === "/dashboard" && pathname === "/dashboard")
    })),
  }
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-7 pl-4">
        {/* <TeamSwitcher teams={data.teams} /> */}
        {state === "collapsed" ? (
          <Image src="/Tru Logo.png" alt="Logo" width={40} height={40} className="object-contain" />
        ) : (
          <>
            <Image src="/tru-light.webp" alt="Logo" width={200} height={90} className="block dark:hidden object-contain" />
            <Image src="/tru-dark.webp" alt="Logo dark" width={200} height={100} className="hidden dark:block object-contain" />
          </>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
