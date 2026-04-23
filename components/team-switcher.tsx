"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ReactNode
    plan: string
  }[]
}) {
  const activeTeam = teams[0]

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            {activeTeam.logo}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold">{activeTeam.name}</span>
            <span className="truncate text-xs text-muted-foreground">{activeTeam.plan}</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
