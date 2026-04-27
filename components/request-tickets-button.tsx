"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { requestTickets } from "@/lib/actions/tickets"
import { toast } from "sonner"
import { Send, Loader2 } from "lucide-react"

export function RequestTicketsButton({ isAlreadyRequesting }: { isAlreadyRequesting: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const [requested, setRequested] = useState(isAlreadyRequesting)

  const handleRequest = async () => {
    setIsLoading(true)
    try {
      await requestTickets()
      toast.success("Solicitud enviada correctamente. Un administrador la revisará pronto.")
      setRequested(true)
    } catch (error) {
      toast.error("Error al enviar la solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  if (requested) {
    return (
      <Button variant="outline" disabled className="bg-amber-500/10 text-amber-600 border-amber-500/20">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Solicitud en proceso...
      </Button>
    )
  }

  return (
    <Button onClick={handleRequest} disabled={isLoading} variant="secondary">
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Solicitar más tickets
    </Button>
  )
}
