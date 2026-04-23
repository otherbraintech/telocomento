"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CreditCard } from "lucide-react"

export function NoCardsDialog({ count }: { count: number }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Solo mostrar si el conteo es 0 y no estamos ya en la página de creación o perfil
    const isExemptedPage = pathname === "/dashboard/tarjetas/nueva" || pathname === "/dashboard/perfil"
    if (count === 0 && !isExemptedPage) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [count, pathname])

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="border-border/50">
        <AlertDialogHeader className="flex flex-col items-center justify-center text-center sm:text-center">
          <div className="mx-auto size-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="size-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center sm:text-center text-xl w-full">¡Comienza ahora!</AlertDialogTitle>
          <AlertDialogDescription className="text-center sm:text-center text-balance w-full">
            Parece que aún no tienes ninguna <strong>tarjeta de monitoreo</strong> creada. 
            Necesitas crear al menos una para que el sistema empiece a buscar publicaciones por ti.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction 
            onClick={() => router.push("/dashboard/tarjetas/nueva")}
            className="w-full sm:w-auto"
          >
            Crear mi primera tarjeta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
