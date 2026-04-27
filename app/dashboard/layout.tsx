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
import { ModeToggle } from "@/components/mode-toggle"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isActive = (session?.user as any)?.status === "ACTIVE";

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

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      _count: {
        select: { scrapingCards: true }
      }
    }
  });

  const cardsCount = user?._count.scrapingCards || 0;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <ProfileSetupDialog user={{
          id: user?.id || "",
          name: user?.name || null,
          username: user?.username || null,
          bio: user?.bio || null
        }} />
        <NoCardsDialog count={cardsCount} />
        <AppSidebar user={session?.user} />
        <SidebarInset className="bg-background text-foreground transition-colors duration-300">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumbs />
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
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
