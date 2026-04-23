"use client"

import { Switch } from "@/components/ui/switch"
import { toggleTarjetaStatus } from "@/lib/actions/tarjetas"
import { useTransition } from "react"

interface Props {
  cardId: string
  status: string
}

export function TarjetaStatusToggle({ cardId, status }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const formData = new FormData()
    formData.append("cardId", cardId)
    formData.append("currentStatus", status)
    
    startTransition(async () => {
      await toggleTarjetaStatus(formData)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Switch 
        checked={status === "ACTIVE"} 
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <span className={`text-[10px] uppercase tracking-wider font-bold ${status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'}`}>
        {status}
      </span>
    </div>
  )
}
