"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import { formatBRL } from "@/lib/format";
import type { PontoSerie } from "@/types";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-11-18" → "18/11"; "2026-11" → "nov/26". */
function rotuloPeriodo(periodo: string) {
  const [ano, mes, dia] = periodo.split("-");
  if (dia) return `${dia}/${mes}`;
  return `${MESES[Number(mes) - 1] ?? mes}/${ano?.slice(2)}`;
}

const compacto = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

function Dica({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  const ponto = payload?.[0]?.payload as PontoSerie | undefined;
  if (!active || !ponto) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{rotuloPeriodo(ponto.periodo)}</p>
      <p>{formatBRL(ponto.faturamento)}</p>
      <p className="text-muted-foreground">
        {ponto.pedidos} {ponto.pedidos === 1 ? "pedido" : "pedidos"}
      </p>
    </div>
  );
}

/** Faturamento por dia (ou mês) no período; o número de pedidos aparece ao passar o mouse. */
export function GraficoVendas({ serie }: { serie: PontoSerie[] }) {
  if (!serie.some((p) => p.faturamento > 0 || p.pedidos > 0)) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Nenhuma venda no período.</p>;
  }

  const total = serie.reduce((acc, p) => acc + p.faturamento, 0);

  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label={`Faturamento no período: ${formatBRL(total)} em ${serie.filter((p) => p.pedidos > 0).length} dias com venda`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={serie} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="periodo"
            tickFormatter={rotuloPeriodo}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(v: number) => compacto.format(v)}
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={Dica} />
          <Bar
            dataKey="faturamento"
            name="Faturamento"
            fill="var(--primary)"
            fillOpacity={0.85}
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
