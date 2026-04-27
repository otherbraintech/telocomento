"use client"

import * as React from "react"
import {
  LayoutDashboard,
  CreditCard,
  Rss,
  MessageSquareQuote,
  Users,
  Settings,
  Bot,
  ShoppingCart,
  Smartphone
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
      title: "Explorar Posts",
      url: "/dashboard/publicaciones",
      icon: <Rss className="size-4" />,
    },
    {
      title: "Gestión de Posts",
      url: "/dashboard/posts",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: "Órdenes",
      url: "/dashboard/ordenes",
      icon: <MessageSquareQuote className="size-4" />,
    },
    {
      title: "Dispositivos",
      url: "/dashboard/dispositivos",
      icon: <Smartphone className="size-4" />,
    },
    {
      title: "Comprar Créditos",
      url: "/dashboard/comprar",
      icon: <ShoppingCart className="size-4" />,
    },
    {
      title: "Mi Perfil",
      url: "/dashboard/perfil",
      icon: <Settings className="size-4" />,
    },
  ],
  adminNav: [
    {
      title: "Gestión de Usuarios",
      url: "/dashboard/usuarios",
      icon: <Users className="size-4" />,
    },
    {
      title: "Admin Publicaciones",
      url: "/dashboard/admin/publicaciones",
      icon: <Rss className="size-4" />,
    },
    {
      title: "Admin Órdenes",
      url: "/dashboard/admin/ordenes",
      icon: <MessageSquareQuote className="size-4" />,
    },
  ]
}

export function AppSidebar({ user, ...props }: { user: any } & React.ComponentProps<typeof Sidebar>) {
  const isAdmin = user?.role === "ADMIN"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} label="Plataforma" />
        {isAdmin && (
          <NavMain items={data.adminNav} label="Administración" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || { name: "Invitado", email: "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
