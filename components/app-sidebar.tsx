"use client"

import * as React from "react"
import {
  LayoutDashboard,
  CreditCard,
  Rss,
  MessageSquareQuote,
  Users,
  Settings,
  Bot
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Administrador",
    email: "admin@telocomento.com",
    avatar: "",
  },
  teams: [
    {
      name: "TeloComento",
      logo: <Bot className="size-4" />,
      plan: "Pro Plan",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard className="size-4" />,
      isActive: true,
    },
    {
      title: "Tarjetas de Monitoreo",
      url: "/dashboard/tarjetas",
      icon: <CreditCard className="size-4" />,
    },
    {
      title: "Publicaciones",
      url: "/dashboard/publicaciones",
      icon: <Rss className="size-4" />,
    },
    {
      title: "Órdenes & Comentarios",
      url: "/dashboard/ordenes",
      icon: <MessageSquareQuote className="size-4" />,
    },
    {
      title: "Usuarios",
      url: "/dashboard/usuarios",
      icon: <Users className="size-4" />,
    },
    {
      title: "Mi Perfil",
      url: "/dashboard/perfil",
      icon: <Settings className="size-4" />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
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
