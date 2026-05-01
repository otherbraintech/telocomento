import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma";
import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs"
import { NoCardsDialog } from "@/components/no-cards-dialog"
import { ProfileSetupDialog } from "@/components/profile-setup-dialog"

import { TooltipProvider } from "@/components/ui/tooltip"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      status: true,
      cardLimit: true,
      orderLimit: true,
      _count: {
        select: {
          scrapingCards: true,
          orders: true
        }
      }
    }
  });

  const isActive = user?.status === "ACTIVE";

  if (!isActive) {
    return (
      <TooltipProvider>
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="mx-auto size-16 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Cuenta en revisión</h1>
              <p className="text-muted-foreground">
                Tu cuenta ha sido registrada con éxito pero aún no ha sido activada por un administrador. 
                Por favor, espera a que validemos tu acceso.
              </p>
            </div>
            <div className="pt-4 border-t border-border/50">
              <form action={async () => {
                "use server"
                const { signOut } = await import("@/auth")
                await signOut()
              }}>
                <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                  Cerrar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  const cardsCount = user?._count.scrapingCards || 0;
  const cardLimit = user?.cardLimit || 0;
  const ordersCount = user?._count.orders || 0;
  const orderLimit = user?.orderLimit || 0;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <ProfileSetupDialog user={{
          id: user?.id || "",
          name: user?.name || null,
          username: user?.username || null,
          bio: user?.bio || null
        }} />
        <AppSidebar user={session?.user} />
        <SidebarInset className="bg-background text-foreground transition-colors duration-300">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumbs />
            </div>
            <div className="flex items-center gap-3">
              {/* Contadores de cuota */}
              <div className="flex items-center gap-2.5 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground" title={`Tarjetas: ${cardsCount} de ${cardLimit}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                  <span className="font-mono font-semibold tabular-nums">{cardsCount}<span className="text-muted-foreground/50">/</span>{cardLimit}</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1 text-muted-foreground" title={`Órdenes creadas: ${ordersCount} de ${orderLimit}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
                  <span className="font-mono font-semibold tabular-nums">{ordersCount}<span className="text-muted-foreground/50">/</span>{orderLimit}</span>
                </div>
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
