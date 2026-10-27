"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { RoleGuard } from "@/components/layout/RoleGuard";
import { ProductForm } from "@/components/produtos/ProductForm";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/services/api";
import { produtoService } from "@/services/produtoService";
import type { Produto, ProdutoRequest } from "@/types";

type Result = { id: string; produto?: Produto; error?: string };

export default function EditarProdutoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = React.useState<Result | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    produtoService
      .buscarPorId(Number(id))
      .then((produto) => !cancelled && setResult({ id, produto }))
      .catch((e) => {
        if (cancelled) return;
        const error = getErrorMessage(e);
        toast.error(error);
        setResult({ id, error });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = result?.id !== id;

  async function handleSubmit(dto: ProdutoRequest) {
    const atualizado = await produtoService.atualizar(Number(id), dto);
    toast.success(`Produto "${atualizado.nome}" atualizado com sucesso.`);
    router.push("/produtos");
  }

  return (
    <RoleGuard allow={["ADMIN", "VENDEDOR"]}>
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold">Editar Produto</h1>

        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Carregando produto">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        ) : result?.produto ? (
          <ProductForm
            produto={result.produto}
            submitLabel="Salvar alterações"
            onSubmit={handleSubmit}
          />
        ) : (
          <div className="space-y-3 rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground">{result?.error}</p>
            <Link href="/produtos" className={buttonVariants({ variant: "outline" })}>
              Voltar para produtos
            </Link>
          </div>
        )}
      </main>
    </RoleGuard>
  );
}
