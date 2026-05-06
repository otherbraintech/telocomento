"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Layers, CalendarDays, X, Search } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

  const toggleView = useCallback(() => {
    const next = view === "swipe" ? "grid" : "swipe";
    setView(next);
    emitViewChange(next);
  }, [view]);

  /** Actualiza searchParams con los nuevos filtros */
  const applyFilters = useCallback(
    (newParams: { desde?: string; status?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (newParams.desde !== undefined) {
        if (newParams.desde) params.set("desde", newParams.desde);
        else params.delete("desde");
      }
      
      if (newParams.status !== undefined) {
        if (newParams.status && newParams.status !== "ALL") params.set("status", newParams.status);
        else params.delete("status");
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const applyDateFilter = useCallback(
    (date: string) => {
      applyFilters({ desde: date });
    },
    [applyFilters]
  );

  const applyStatusFilter = useCallback(
    (status: string) => {
      setStatusFilter(status);
      applyFilters({ status });
    },
    [applyFilters]
  );

  const clearDateFilter = useCallback(() => {
    setDateValue("");
    applyFilters({ desde: "" });
  }, [applyFilters]);

  // Sincronizar statusFilter con searchParams al cargar
  useEffect(() => {
    const s = searchParams.get("status") || "PENDING";
    setStatusFilter(s);
  }, [searchParams]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Badge de pendientes (Mantenido por consistencia) */}
          <Badge
            variant="outline"
            className="px-3 py-1 border-primary/30 text-primary shrink-0"
          >
            {pendingCount} Pendiente{pendingCount !== 1 ? "s" : ""}
          </Badge>

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* Filtros de Estado */}
          <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-lg border border-border/50">
            <Button
              variant={statusFilter === "ALL" ? "default" : "ghost"}
              size="sm"
              className={`h-7 text-[11px] font-bold px-3 transition-all ${
                statusFilter === "ALL" 
                  ? "bg-foreground text-background shadow-sm" 
                  : "hover:bg-muted text-muted-foreground"
              }`}
              onClick={() => applyStatusFilter("ALL")}
            >
              TODOS
            </Button>
            <Button
              variant={statusFilter === "PENDING" ? "default" : "ghost"}
              size="sm"
              className={`h-7 text-[11px] font-bold px-3 transition-all ${
                statusFilter === "PENDING" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-primary/10 hover:text-primary text-muted-foreground"
              }`}
              onClick={() => applyStatusFilter("PENDING")}
            >
              PENDIENTES
            </Button>
            <Button
              variant={statusFilter === "APPROVED" ? "default" : "ghost"}
              size="sm"
              className={`h-7 text-[11px] font-bold px-3 transition-all ${
                statusFilter === "APPROVED" 
                  ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700" 
                  : "hover:bg-emerald-500/10 hover:text-emerald-600 text-muted-foreground"
              }`}
              onClick={() => applyStatusFilter("APPROVED")}
            >
              APROBADOS
            </Button>
            <Button
              variant={statusFilter === "REJECTED" ? "default" : "ghost"}
              size="sm"
              className={`h-7 text-[11px] font-bold px-3 transition-all ${
                statusFilter === "REJECTED" 
                  ? "bg-red-600 text-white shadow-sm hover:bg-red-700" 
                  : "hover:bg-red-500/10 hover:text-red-600 text-muted-foreground"
              }`}
              onClick={() => applyStatusFilter("REJECTED")}
            >
              RECHAZADOS
            </Button>
          </div>

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* Filtro de fecha */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
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
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Buscador */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Buscar por autor o contenido..."
                className="h-9 w-full pl-8 pr-3 text-sm rounded-lg border border-input bg-background/50 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                onChange={(e) => {
                  window.dispatchEvent(new CustomEvent("review-search", { detail: e.target.value }));
                }}
              />
            </div>
          </div>

          <div className="h-5 w-px bg-border hidden lg:block" />

          {/* Toggle de vista */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={view === "grid" ? "default" : "outline"}
                size="sm"
                className="gap-2 h-9 text-xs px-4 rounded-lg font-bold shadow-sm"
                onClick={toggleView}
              >
                {view === "swipe" ? (
                  <>
                    <LayoutGrid className="w-4 h-4" />
                    Vista Grid
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    Vista Swipe
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
      </div>
    </TooltipProvider>
  );
}
