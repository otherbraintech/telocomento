"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FindingTrendChartProps {
  data: {
    date: string;
    publicaciones: number;
    ordenes: number;
    comentarios: number;
  }[];
}

const chartConfig = {
  publicaciones: {
    label: "Publicaciones",
    color: "#3b82f6",
  },
  ordenes: {
    label: "Órdenes",
    color: "#10b981",
  },
  comentarios: {
    label: "Comentarios",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export function FindingTrendChart({ data }: FindingTrendChartProps) {
  const [timeRange, setTimeRange] = React.useState("7d");

  const filteredData = React.useMemo(() => {
    return data.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  return (
    <Card className="col-span-4 shadow-sm border-border/50">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-base font-semibold">Tendencia de Actividad</CardTitle>
          <CardDescription>
            Visualización detallada de hallazgos, órdenes y comentarios.
          </CardDescription>
        </div>
        <div className="flex items-center px-6 py-4 sm:border-l sm:py-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-lg sm:ml-auto"
              aria-label="Seleccionar rango"
            >
              <SelectValue placeholder="Últimos 7 días" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg" disabled>
                Próximamente
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPublicaciones" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#3b82f6"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#3b82f6"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillOrdenes" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#10b981"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#10b981"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillComentarios" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#ef4444"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#ef4444"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="comentarios"
              type="natural"
              fill="url(#fillComentarios)"
              stroke="#ef4444"
              stackId="a"
            />
            <Area
              dataKey="ordenes"
              type="natural"
              fill="url(#fillOrdenes)"
              stroke="#10b981"
              stackId="a"
            />
            <Area
              dataKey="publicaciones"
              type="natural"
              fill="url(#fillPublicaciones)"
              stroke="#3b82f6"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
