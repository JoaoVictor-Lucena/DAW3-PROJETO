import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BannerLoja } from "@/components/loja/BannerLoja";
import { FiltrosLoja } from "@/components/loja/FiltrosLoja";
import { GradeProdutosLoja } from "@/components/loja/GradeProdutosLoja";
import { Skeleton } from "@/components/ui/skeleton";
import { ordenacaoParaSort, parseOrdenacao } from "@/lib/loja";
import { categoriaService } from "@/services/categoriaService";
import { getProdutosPorVendedor } from "@/services/produtoService";
import { vendedorService } from "@/services/vendedorService";
import type { Categoria } from "@/types";

const TAMANHO_PAGINA = 12;

type SearchParams = Record<string, string | string[] | undefined>;

interface LojaPageProps {
  params: Promise<{ idVendedor: string }>;
  searchParams: Promise<SearchParams>;
}

function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

function inteiroPositivo(valor: string | undefined): number | undefined {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export async function generateMetadata({ params }: Pick<LojaPageProps, "params">): Promise<Metadata> {
  const { idVendedor } = await params;
  try {
    const vendedor = await vendedorService.getVendedorPublico(idVendedor);
    const nome = vendedor.nomeLoja || vendedor.nome || vendedor.razaoSocial || "Loja";
    return {
      title: nome,
      description: vendedor.descricao || `Conheça os produtos e ofertas de ${nome}`,
    };
  } catch {
    return { title: "Loja não encontrada" };
  }
}

async function LojaConteudo({ params, searchParams }: LojaPageProps) {
  const { idVendedor } = await params;
  const query = await searchParams;

  const ordenacao = parseOrdenacao(primeiro(query.ordenacao));
  const idCategoria = inteiroPositivo(primeiro(query.categoria));
  const pagina = inteiroPositivo(primeiro(query.pagina)) ?? 1;

  let vendedor;
  try {
    vendedor = await vendedorService.getVendedorPublico(idVendedor);
  } catch {
    notFound();
  }
  if (!vendedor) notFound();

  const [produtos, categorias] = await Promise.all([
    getProdutosPorVendedor(idVendedor, {
      pagina: pagina - 1,
      tamanho: TAMANHO_PAGINA,
      ordenacao: ordenacaoParaSort(ordenacao),
      idCategoria,
    }),
    categoriaService.listarTodas().catch((): Categoria[] => []),
  ]);

  return (
    <div className="pb-12">
      <BannerLoja vendedor={vendedor} />

      <div className="container mx-auto space-y-6 px-4 py-8">
        <section id="produtos-loja" aria-label="Catálogo de produtos da loja" className="space-y-6">
          <FiltrosLoja categorias={categorias} ordenacao={ordenacao} idCategoria={idCategoria} />
          <GradeProdutosLoja page={produtos} />
        </section>
      </div>
    </div>
  );
}

function LojaSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando loja">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="container mx-auto grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function LojaPage({ params, searchParams }: LojaPageProps) {
  return (
    <React.Suspense fallback={<LojaSkeleton />}>
      <LojaConteudo params={params} searchParams={searchParams} />
    </React.Suspense>
  );
}
