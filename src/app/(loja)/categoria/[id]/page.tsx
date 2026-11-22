import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PaginaBusca } from "@/components/busca/PaginaBusca";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchParams } from "@/lib/busca";
import { categoriaService } from "@/services/categoriaService";

interface CategoriaPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}

function idValido(valor: string): number | null {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function generateMetadata({ params }: Pick<CategoriaPageProps, "params">): Promise<Metadata> {
  const { id } = await params;
  const idCategoria = idValido(id);
  if (idCategoria === null) return { title: "Categoria não encontrada" };
  try {
    const categoria = await categoriaService.buscarPorId(idCategoria);
    return {
      title: categoria.nome,
      description: categoria.descricao || `Produtos da categoria ${categoria.nome}`,
    };
  } catch {
    return { title: "Categoria não encontrada" };
  }
}

async function CategoriaConteudo({ params, searchParams }: CategoriaPageProps) {
  const { id } = await params;
  const idCategoria = idValido(id);
  if (idCategoria === null) notFound();

  let nome: string;
  try {
    nome = (await categoriaService.buscarPorId(idCategoria)).nome;
  } catch {
    notFound();
  }

  return (
    <PaginaBusca modo="categoria" searchParams={searchParams} idCategoria={idCategoria} nomeCategoria={nome} />
  );
}

export default function CategoriaPage({ params, searchParams }: CategoriaPageProps) {
  return (
    <React.Suspense fallback={<Skeleton className="mx-auto mt-8 h-64 w-full max-w-6xl" />}>
      <CategoriaConteudo params={params} searchParams={searchParams} />
    </React.Suspense>
  );
}
