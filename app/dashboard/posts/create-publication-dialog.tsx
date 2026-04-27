"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2 } from "lucide-react";
import { createManualPublication } from "@/lib/actions/publications";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreatePublicationDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      sourceUrl: formData.get("sourceUrl") as string,
      authorName: formData.get("authorName") as string,
      imageUrl: formData.get("imageUrl") as string || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=60", // Default icon image
      content: formData.get("content") as string,
    };

    try {
      await createManualPublication(data);
      toast.success("Publicación creada", {
        description: "La publicación se ha creado correctamente.",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo crear la publicación.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Crear Publicación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nueva Publicación</DialogTitle>
            <DialogDescription>
              Ingresa los detalles de la publicación manualmente. Esto permitirá generar órdenes para la IA.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sourceUrl">URL de la Publicación</Label>
              <Input
                id="sourceUrl"
                name="sourceUrl"
                placeholder="https://facebook.com/..."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authorName">Autor (Opcional)</Label>
              <Input
                id="authorName"
                name="authorName"
                placeholder="Nombre del autor o página"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">URL de Imagen (Opcional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Contenido / Texto del Post</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="¿De qué trata la publicación?"
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Publicación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
