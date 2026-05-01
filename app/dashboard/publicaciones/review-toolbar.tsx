"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Layers, CalendarDays, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

/**
 * Emite un evento custom para comunicar la vista activa
 * al ReviewFeed sin tener que pasar por el server component.
 */
function emitViewChange(view: "swipe" | "grid") {
  window.dispatchEvent(new CustomEvent("review-view-change", { detail: view }));
}

interface ReviewToolbarProps {
  pendingCount: number;
  currentDesde?: string;
  tarjetaId?: string;
  keyword?: string;
}

export function ReviewToolbar({
  pendingCount,
  currentDesde,
  tarjetaId,
  keyword,
}: ReviewToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"swipe" | "grid">("swipe");
  const [dateValue, setDateValue] = useState(currentDesde ?? "");

  const toggleView = useCallback(() => {
    const next = view === "swipe" ? "grid" : "swipe";
    setView(next);
    emitViewChange(next);
  }, [view]);

  /** Actualiza searchParams con la nueva fecha */
  const applyDateFilter = useCallback(
    (date: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (date) {
        params.set("desde", date);
      } else {
        params.delete("desde");
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearDateFilter = useCallback(() => {
    setDateValue("");
    applyDateFilter("");
  }, [applyDateFilter]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Badge de pendientes */}
        <Badge
          variant="outline"
          className="px-3 py-1 border-primary/30 text-primary shrink-0"
        >
          {pendingCount} Pendiente{pendingCount !== 1 ? "s" : ""}
        </Badge>

        {/* Separador visual */}
        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* Filtro de fecha */}
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <label
                htmlFor="date-filter"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desde</span>
              </label>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Filtrar publicaciones extraídas desde esta fecha
            </TooltipContent>
          </Tooltip>

          <input
            id="date-filter"
            type="date"
            value={dateValue}
            onChange={(e) => {
              setDateValue(e.target.value);
              applyDateFilter(e.target.value);
            }}
            className="h-7 px-2 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors [color-scheme:dark]"
          />

          {dateValue && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={clearDateFilter}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Separador visual */}
        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* Toggle de vista */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="sm"
              className="gap-1.5 h-7 text-xs px-2.5"
              onClick={toggleView}
            >
              {view === "swipe" ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Vista Grid</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Vista Swipe</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {view === "swipe"
              ? "Cambiar a vista de cuadrícula"
              : "Cambiar a vista de tarjetas (swipe)"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
