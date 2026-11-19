"use client";

import { Estrelas } from "@/components/produtos/Estrelas";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Carrossel } from "@/components/vitrine/Carrossel";
import type { LojaDestaque } from "@/lib/vitrine";

function CardLoja({ loja }: { loja: LojaDestaque }) {
  const inicial = loja.nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <Card className="h-full items-center gap-2 py-5 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
        aria-hidden
      >
        {inicial}
      </div>
      <h3 className="line-clamp-2 min-h-10 px-3 text-sm font-medium leading-5">{loja.nome}</h3>
      <Estrelas media={loja.media} total={loja.totalAvaliacoes} />
      <p className="text-xs text-muted-foreground">
        {loja.totalProdutos} {loja.totalProdutos === 1 ? "produto" : "produtos"}
      </p>
    </Card>
  );
}

function CardLojaSkeleton() {
  return (
    <Card className="h-full items-center gap-2 py-5" aria-hidden>
      <Skeleton className="size-14 rounded-full" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-3 w-16" />
    </Card>
  );
}

export function LojasEmDestaque({
  lojas,
  carregando,
}: {
  lojas: LojaDestaque[];
  carregando: boolean;
}) {
  if (!carregando && lojas.length === 0) return null;

  return (
    <section aria-label="Lojas em destaque" className="space-y-3">
      <h2 className="text-xl font-bold">Lojas em destaque</h2>
      <Carrossel ariaLabel="Lojas em destaque">
        {carregando
          ? Array.from({ length: 4 }).map((_, i) => <CardLojaSkeleton key={i} />)
          : lojas.map((loja) => <CardLoja key={loja.id} loja={loja} />)}
      </Carrossel>
    </section>
  );
}
