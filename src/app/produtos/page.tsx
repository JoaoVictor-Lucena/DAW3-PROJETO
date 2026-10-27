"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PackageIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { DeleteProductModal } from "@/components/produtos/DeleteProductModal";
import { ExportProductsButton } from "@/components/produtos/ExportProductsButton";
import {
  ProductFilters,
  type FiltrosAplicados,
  type SortKey,
} from "@/components/produtos/ProductFilters";
import { ProductList, ProductListSkeleton } from "@/components/produtos/ProductList";
import { ProductStats } from "@/components/produtos/ProductStats";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/services/api";
import { categoriaService } from "@/services/categoriaService";
import { produtoService } from "@/services/produtoService";
import type { Categoria, Page, Produto } from "@/types";

type Result = { key: string; page?: Page<Produto>; error?: string };

function sortProdutos(produtos: Produto[], sort: SortKey): Produto[] {
  if (sort === "none") return produtos;
  const copy = [...produtos];
  switch (sort) {
    case "preco-asc":
      return copy.sort((a, b) => a.preco - b.preco);
    case "preco-desc":
      return copy.sort((a, b) => b.preco - a.preco);
    case "nome-asc":
      return copy.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    case "estoque-asc":
      return copy.sort((a, b) => a.estoque - b.estoque);
    case "estoque-desc":
      return copy.sort((a, b) => b.estoque - a.estoque);
  }
}

export default function ProdutosPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "VENDEDOR";

  const [filtros, setFiltros] = React.useState<FiltrosAplicados>({});
  const [pageIndex, setPageIndex] = React.useState(0);
  const [sort, setSort] = React.useState<SortKey>("none");
  const [reload, setReload] = React.useState(0);
  const [categorias, setCategorias] = React.useState<Categoria[]>([]);
  const [result, setResult] = React.useState<Result | null>(null);
  const [toDelete, setToDelete] = React.useState<Produto | null>(null);

  // Categorias para o select de filtro
  React.useEffect(() => {
    let cancelled = false;
    categoriaService
      .listarTodas()
      .then((c) => !cancelled && setCategorias(c))
      .catch((e) => !cancelled && toast.error(getErrorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  const queryKey = JSON.stringify({ filtros, pageIndex, reload });

  React.useEffect(() => {
    let cancelled = false;
    produtoService
      .buscar({ ...filtros, page: pageIndex })
      .then((page) => !cancelled && setResult({ key: queryKey, page }))
      .catch((e) => {
        if (cancelled) return;
        const error = getErrorMessage(e);
        toast.error(error);
        setResult({ key: queryKey, error });
      });
    return () => {
      cancelled = true;
    };
    // queryKey já serializa filtros, pageIndex e reload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const loading = result?.key !== queryKey;
  const page = !loading ? result?.page : undefined;
  const error = !loading ? result?.error : undefined;

  const produtos = React.useMemo(
    () => sortProdutos(page?.content ?? [], sort),
    [page, sort],
  );

  const hasFilters = Object.values(filtros).some((v) => v !== undefined);

  function handleApply(next: FiltrosAplicados) {
    setFiltros(next);
    setPageIndex(0);
  }

  function handleClear() {
    setFiltros({});
    setPageIndex(0);
    setSort("none");
  }

  function handleDeleted() {
    if (page && page.content.length <= 1 && pageIndex > 0) {
      setPageIndex((p) => Math.max(p - 1, 0));
    } else {
      setReload((r) => r + 1);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o catálogo do marketplace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportProductsButton produtos={produtos} disabled={loading} />
          {canEdit && (
            <Link href="/produtos/novo" className={buttonVariants({ size: "lg" })}>
              <PlusIcon /> Novo Produto
            </Link>
          )}
        </div>
      </div>

      <ProductStats
        produtos={produtos}
        totalElements={page?.totalElements ?? 0}
        loading={loading}
      />

      <ProductFilters
        categorias={categorias}
        sort={sort}
        disabled={loading}
        onApply={handleApply}
        onSortChange={setSort}
        onClear={handleClear}
      />

      {loading ? (
        <ProductListSkeleton />
      ) : error ? (
        <div className="space-y-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => setReload((r) => r + 1)}>
            Tentar novamente
          </Button>
        </div>
      ) : produtos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <PackageIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">
            {hasFilters ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasFilters
              ? "Tente ajustar ou limpar os filtros."
              : user?.role === "ADMIN"
                ? 'Clique em "Popular Banco (Seed)" no topo para gerar dados de teste.'
                : "Volte mais tarde ou cadastre um novo produto."}
          </p>
        </div>
      ) : (
        <ProductList produtos={produtos} canEdit={canEdit} onDelete={setToDelete} />
      )}

      {page && page.totalElements > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Página {page.number + 1} de {Math.max(page.totalPages, 1)} ·{" "}
            {page.totalElements} {page.totalElements === 1 ? "registro" : "registros"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page.first}
              onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
            >
              <ChevronLeftIcon /> Anterior
            </Button>
            <Button
              variant="outline"
              disabled={page.last}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              Próxima <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}

      <DeleteProductModal
        produto={toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        onDeleted={handleDeleted}
      />
    </main>
  );
}
