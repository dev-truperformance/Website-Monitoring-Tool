"use client"

import { type LucideIcon } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
}) {
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null)
  const router = useRouter()

  const handleNavigation = (url: string) => {
    setLoadingUrl(url)
    router.push(url)
    // Reset loading after a short delay to handle fast navigation
    setTimeout(() => setLoadingUrl(null), 500)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              asChild 
              isActive={item.isActive}
              onClick={() => handleNavigation(item.url)}
              className="cursor-pointer"
            >
              <div>
                {loadingUrl === item.url ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  item.icon && <item.icon />
                )}
                <span>{item.title}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
