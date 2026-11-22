"use client";

import Link from "next/link";

import { Estrelas } from "@/components/produtos/Estrelas";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Carrossel } from "@/components/vitrine/Carrossel";
import type { VendedorPublico } from "@/types";

function CardLoja({ loja }: { loja: VendedorPublico }) {
  const inicial = loja.nome.trim().charAt(0).toUpperCase() || "?";

  return (
    <Link
      href={`/loja/${loja.id}`}
      aria-label={`Ver a loja ${loja.nome}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full items-center gap-2 py-5 text-center transition-colors group-hover:bg-muted/50">
        <div
          className="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
          aria-hidden
        >
          {inicial}
        </div>
        <h3 className="line-clamp-2 min-h-10 px-3 text-sm font-medium leading-5 group-hover:underline">
          {loja.nome}
        </h3>
        {loja.descricao && (
          <p className="line-clamp-2 px-3 text-xs text-muted-foreground">{loja.descricao}</p>
        )}
        <Estrelas media={loja.mediaAvaliacoes} total={loja.totalAvaliacoes} />
        <p className="text-xs text-muted-foreground">
          {loja.totalProdutos} {loja.totalProdutos === 1 ? "produto" : "produtos"}
        </p>
      </Card>
    </Link>
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
  lojas: VendedorPublico[];
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
