"use client";

import * as React from "react";
import {
  BoxesIcon,
  DollarSignIcon,
  LayersIcon,
  PackageIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL } from "@/lib/format";
import type { Produto } from "@/types";

interface Props {
  produtos: Produto[];
  totalElements: number;
  loading?: boolean;
}

const ESTOQUE_BAIXO_LIMITE = 5;

const BAR_COLORS = [
  "bg-primary",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
];

export function ProductStats({ produtos, totalElements, loading }: Props) {
  const { precoMedio, somaEstoque, estoqueCritico, distCategorias } =
    React.useMemo(() => {
      if (produtos.length === 0) {
        return {
          precoMedio: 0,
          somaEstoque: 0,
          estoqueCritico: 0,
          distCategorias: [] as { nome: string; count: number; pct: number }[],
        };
      }

      const somaPreco = produtos.reduce((acc, p) => acc + p.preco, 0);
      const somaEst = produtos.reduce((acc, p) => acc + p.estoque, 0);
      const criticos = produtos.filter(
        (p) => p.estoque <= ESTOQUE_BAIXO_LIMITE,
      ).length;

      const mapa = new Map<string, number>();
      for (const p of produtos) {
        const key = p.nomeCategoria || "Sem categoria";
        mapa.set(key, (mapa.get(key) ?? 0) + 1);
      }

      const dist = Array.from(mapa.entries())
        .map(([nome, count]) => ({
          nome,
          count,
          pct: Math.round((count / produtos.length) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      return {
        precoMedio: somaPreco / produtos.length,
        somaEstoque: somaEst,
        estoqueCritico: criticos,
        distCategorias: dist,
      };
    }, [produtos]);

  if (loading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-busy="true"
        aria-label="Carregando estatísticas"
      >
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <section
      aria-label="Resumo do catálogo"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <Card size="sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardDescription className="font-medium">
            Total no Catálogo
          </CardDescription>
          <PackageIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">{totalElements}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {produtos.length} {produtos.length === 1 ? "item" : "itens"} nesta
            página
          </p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardDescription className="font-medium">
            Preço Médio (Página)
          </CardDescription>
          <DollarSignIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">
            {formatBRL(precoMedio)}
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Média dos produtos visíveis
          </p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardDescription className="font-medium">
            Unidades em Estoque
          </CardDescription>
          <BoxesIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">{somaEstoque}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {estoqueCritico === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                Nenhum item com estoque crítico
              </span>
            ) : (
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {estoqueCritico}{" "}
                {estoqueCritico === 1
                  ? "item baixo/esgotado (≤ 5)"
                  : "itens baixos/esgotados (≤ 5)"}
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardDescription className="font-medium">
            Distribuição por Categoria
          </CardDescription>
          <LayersIcon className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          {distCategorias.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem dados na página</p>
          ) : (
            <>
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label="Proporção de categorias na página"
              >
                {distCategorias.map((cat, idx) => (
                  <div
                    key={cat.nome}
                    style={{ width: `${cat.pct}%` }}
                    title={`${cat.nome}: ${cat.count} (${cat.pct}%)`}
                    className={BAR_COLORS[idx % BAR_COLORS.length]}
                  />
                ))}
              </div>
              <div className="space-y-1">
                {distCategorias.slice(0, 3).map((cat, idx) => (
                  <div
                    key={cat.nome}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span
                        className={`inline-block size-2 shrink-0 rounded-full ${BAR_COLORS[idx % BAR_COLORS.length]}`}
                      />
                      <span className="truncate">{cat.nome}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {cat.count} ({cat.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
