import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BarraResultados } from "@/components/busca/BarraResultados";
import { ChipsFiltros } from "@/components/busca/ChipsFiltros";
import { FiltrosBusca, type LojaOpcao } from "@/components/busca/FiltrosBusca";
import { ResultadosBusca } from "@/components/busca/ResultadosBusca";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  comMudanca,
  contarFiltrosAtivos,
  ordenacaoBuscaParaSort,
  parseFiltros,
  semFiltros,
  TAMANHO_PAGINA_BUSCA,
  urlBusca,
  type ModoBusca,
  type SearchParams,
} from "@/lib/busca";
import { categoriaService } from "@/services/categoriaService";
import { produtoService } from "@/services/produtoService";
import { vendedorService } from "@/services/vendedorService";
import type { Categoria, Page, Produto } from "@/types";

interface Props {
  modo: ModoBusca;
  searchParams: Promise<SearchParams>;
  idCategoria?: number;
  nomeCategoria?: string;
}

async function carregarLojas(): Promise<LojaOpcao[]> {
  try {
    const vendedores = await vendedorService.listarTodos();
    return vendedores
      .filter((v) => v.ativo !== false)
      .map((v) => ({ id: v.id, nome: v.nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  } catch {
    return [];
  }
}

async function Conteudo({ modo, searchParams, idCategoria, nomeCategoria }: Props) {
  const sp = await searchParams;
  const filtros = parseFiltros(sp, idCategoria);

  const [categorias, lojas, resultado] = await Promise.all([
    categoriaService.listarTodas().catch((): Categoria[] => []),
    carregarLojas(),
    produtoService
      .buscarVitrine({
        nome: filtros.q,
        idCategoria: filtros.categoria,
        precoMin: filtros.precoMin,
        precoMax: filtros.precoMax,
        avaliacaoMin: filtros.notaMin,
        somenteComEstoque: filtros.soEstoque,
        idVendedor: filtros.loja,
        sort: ordenacaoBuscaParaSort(filtros.ordenar),
        page: filtros.pagina - 1,
        size: TAMANHO_PAGINA_BUSCA,
      })
      .catch((): null => null),
  ]);

  const page: Page<Produto> | null = resultado;

  if (page && page.content.length === 0 && page.totalElements > 0 && filtros.pagina > 1) {
    redirect(urlBusca(comMudanca(filtros, { pagina: 1 }), modo));
  }

  const chaveUrl = urlBusca({ ...filtros, pagina: 1 }, modo);
  const hrefLimpar = urlBusca(semFiltros(filtros, modo), modo);
  const filtrosAtivos = contarFiltrosAtivos(filtros, modo);

  const titulo =
    modo === "categoria"
      ? (nomeCategoria ?? "Categoria")
      : filtros.q
        ? `Resultados para “${filtros.q}”`
        : "Todos os produtos";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        {modo === "categoria" && filtros.q && (
          <p className="text-sm text-muted-foreground">Buscando por “{filtros.q}” nesta categoria</p>
        )}
        {modo === "busca" && filtros.q && (
          <p className="text-sm text-muted-foreground">Mostrando produtos que combinam com a sua busca.</p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Sidebar de filtros (desktop). No mobile os mesmos filtros abrem em um drawer. */}
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-24 rounded-xl border p-4">
            <FiltrosBusca key={chaveUrl} filtros={filtros} modo={modo} categorias={categorias} lojas={lojas} />
          </div>
        </aside>

        <section className="min-w-0 space-y-4" aria-label="Resultados">
          <BarraResultados
            key={chaveUrl}
            filtros={filtros}
            modo={modo}
            categorias={categorias}
            lojas={lojas}
            totalResultados={page?.totalElements ?? 0}
            filtrosAtivos={filtrosAtivos}
          />
          <ChipsFiltros filtros={filtros} modo={modo} categorias={categorias} lojas={lojas} />

          {page ? (
            <ResultadosBusca
              page={page}
              filtros={filtros}
              modo={modo}
              temFiltros={filtrosAtivos > 0}
              hrefLimpar={hrefLimpar}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center">
              <p className="font-semibold">Não foi possível carregar os produtos.</p>
              <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
              <Link href={urlBusca(filtros, modo)} className={buttonVariants({ variant: "outline" })}>
                Tentar novamente
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function BuscaSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8" aria-busy="true" aria-label="Carregando produtos">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Skeleton className="hidden h-96 lg:block" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PaginaBusca(props: Props) {
  return (
    <React.Suspense fallback={<BuscaSkeleton />}>
      <Conteudo {...props} />
    </React.Suspense>
  );
}
