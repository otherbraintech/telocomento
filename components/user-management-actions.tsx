"use client"

import { Button } from "@/components/ui/button"
import { deleteUser } from "@/lib/actions/users"
import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { UserDialog } from "./user-dialog"

interface Props {
  user: any
}

export function UserManagementActions({ user }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      startTransition(() => deleteUser(user.id))
    }
  }

  return (
    <div className="flex items-center gap-2">
      <UserDialog user={user} />

      <Button 
        variant="outline" 
        size="icon" 
        className="size-8 hover:bg-destructive hover:text-destructive-foreground" 
        onClick={handleDelete}
        disabled={isPending}
        title="Eliminar"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
