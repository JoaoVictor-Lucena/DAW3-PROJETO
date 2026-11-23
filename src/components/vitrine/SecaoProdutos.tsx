"use client";

import Link from "next/link";

import {
  CardProdutoVitrine,
  CardProdutoVitrineSkeleton,
} from "@/components/produtos/CardProdutoVitrine";
import { Carrossel } from "@/components/vitrine/Carrossel";
import type { Produto } from "@/types";
export function SecaoProdutos({
  titulo,
  produtos,
  carregando,
}: {
  titulo: string;
  produtos: Produto[];
  carregando: boolean;
}) {
  if (!carregando && produtos.length === 0) return null;

  return (
    <section aria-label={titulo} className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-bold">{titulo}</h2>
        <Link href="/produtos" className="text-sm font-medium text-primary hover:underline">
          Ver todos
        </Link>
      </div>

      <Carrossel ariaLabel={titulo}>
        {carregando
          ? Array.from({ length: 8 }).map((_, i) => <CardProdutoVitrineSkeleton key={i} />)
          : produtos.map((p) => <CardProdutoVitrine key={p.id} produto={p} />)}
      </Carrossel>
    </section>
  );
}
