"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchXIcon } from "lucide-react";

import { Paginacao } from "@/components/admin/Paginacao";
import { ProductCard } from "@/components/produtos/ProductCard";
import { buttonVariants } from "@/components/ui/button";
import { comMudanca, urlBusca, type FiltrosBusca, type ModoBusca } from "@/lib/busca";
import type { Page, Produto } from "@/types";

const SEM_ACAO = () => {};

interface Props {
  page: Page<Produto>;
  filtros: FiltrosBusca;
  modo: ModoBusca;
  temFiltros: boolean;
  hrefLimpar: string;
}

export function ResultadosBusca({ page, filtros, modo, temFiltros, hrefLimpar }: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function irParaPagina(indice: number) {
    startTransition(() =>
      router.push(urlBusca(comMudanca(filtros, { pagina: indice + 1 }), modo), { scroll: true }),
    );
  }

  if (page.content.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center">
        <SearchXIcon className="size-10 text-muted-foreground" />
        <p className="text-lg font-semibold">Nenhum produto encontrado</p>
        <p className="max-w-md text-sm text-muted-foreground">
          {temFiltros
            ? "Nenhum produto atende a todos os filtros escolhidos. Tente limpar os filtros para ver mais resultados."
            : "Tente buscar por outro termo ou explore as categorias."}
        </p>
        {temFiltros ? (
          <Link href={hrefLimpar} className={buttonVariants({ variant: "default" })}>
            Limpar filtros
          </Link>
        ) : (
          <Link href="/busca" className={buttonVariants({ variant: "outline" })}>
            Ver todos os produtos
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6" aria-busy={pending}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {page.content.map((p) => (
          <ProductCard key={p.id} produto={p} canEdit={false} onDelete={SEM_ACAO} />
        ))}
      </div>
      <Paginacao page={page} disabled={pending} onChange={irParaPagina} />
    </div>
  );
}
