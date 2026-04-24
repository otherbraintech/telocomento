"use client"

import { usePathname, useSearchParams } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"

const routeMap: Record<string, string> = {
  dashboard: "Inicio",
  tarjetas: "Tarjetas de Monitoreo",
  publicaciones: "Explorar Posts",
  posts: "Gestión de Posts",
  ordenes: "Mis Órdenes",
  comprar: "Comprar Créditos",
  perfil: "Mi Perfil",
  usuarios: "Gestión de Usuarios",
  admin: "Administración",
  nueva: "Nueva",
}

export default function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pathSegments = pathname.split("/").filter((segment) => segment !== "")

  // Si hay un keyword en la URL (ej. desde tarjeta → publicaciones), lo mostramos
  const keyword = searchParams.get("keyword")
  const tarjetaId = searchParams.get("tarjetaId")
  const isPublicacionesFiltradas = pathname === "/dashboard/publicaciones" && !!tarjetaId && !!keyword

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard" className="font-bold">
            TeloComento
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathSegments.map((segment, index) => {
          if (segment === "dashboard" && index === 0) return null
          
          const isLast = index === pathSegments.length - 1 && !isPublicacionesFiltradas
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`
          
          // Si el segmento parece un ID (cuid), mostrar "Detalle"
          const isCuid = segment.length > 20 && /^[a-z0-9]+$/.test(segment)
          const label = isCuid ? "Detalle" : (routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1))

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}

        {/* Breadcrumb extra: nombre de la tarjeta cuando se filtra */}
        {isPublicacionesFiltradas && (
          <React.Fragment>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{keyword}</BreadcrumbPage>
            </BreadcrumbItem>
          </React.Fragment>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
