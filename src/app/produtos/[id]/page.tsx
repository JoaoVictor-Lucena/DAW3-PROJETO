"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  MessageSquareIcon,
  PencilIcon,
  StarIcon,
  StoreIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { DeleteProductModal } from "@/components/produtos/DeleteProductModal";
import { StockBadge } from "@/components/produtos/StockBadge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { formatBRL, formatDateTime } from "@/lib/format";
import { getErrorMessage } from "@/services/api";
import { avaliacaoService } from "@/services/avaliacaoService";
import { produtoService } from "@/services/produtoService";
import type { Avaliacao, Produto } from "@/types";

type ProdutoResult = { id: string; produto?: Produto; error?: string };
type AvaliacoesResult = { id: string; avaliacoes: Avaliacao[] };

function Stars({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Nota ${nota} de 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < nota;
        return (
          <StarIcon
            key={i}
            className={`size-4 ${
              filled
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function DetalheProdutoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "VENDEDOR";

  const [result, setResult] = React.useState<ProdutoResult | null>(null);
  const [avaliacoesRes, setAvaliacoesRes] = React.useState<AvaliacoesResult | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const numericId = Number(id);

    produtoService
      .buscarPorId(numericId)
      .then((produto) => !cancelled && setResult({ id, produto }))
      .catch((e) => {
        if (cancelled) return;
        const error = getErrorMessage(e);
        toast.error(error);
        setResult({ id, error });
      });

    avaliacaoService
      .listarPorProduto(numericId)
      .then((avaliacoes) => !cancelled && setAvaliacoesRes({ id, avaliacoes }))
      .catch(() => {
        if (!cancelled) setAvaliacoesRes({ id, avaliacoes: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = result?.id !== id;
  const produto = !loading ? result?.produto : undefined;
  const loadingAvaliacoes = avaliacoesRes?.id !== id;
  const avaliacoes = !loadingAvaliacoes ? avaliacoesRes.avaliacoes : [];

  const mediaNota =
    avaliacoes.length > 0
      ? (
          avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length
        ).toFixed(1)
      : null;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/produtos" className={buttonVariants({ variant: "outline" })}>
          <ArrowLeftIcon /> Voltar para listagem
        </Link>

        {canEdit && produto && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/produtos/${produto.id}/editar`}
              className={buttonVariants({ variant: "outline" })}
            >
              <PencilIcon /> Editar Produto
            </Link>
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2Icon /> Excluir Produto
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Carregando produto">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : !produto ? (
        <div className="space-y-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            {result?.error ?? "Produto não encontrado."}
          </p>
          <Link href="/produtos" className={buttonVariants({ variant: "outline" })}>
            Voltar para listagem
          </Link>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardDescription>Produto #{produto.id}</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    {produto.nome}
                  </CardTitle>
                </div>
                <Badge variant="secondary">{produto.nomeCategoria}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Preço</p>
                  <p className="text-2xl font-bold">{formatBRL(produto.preco)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estoque</p>
                  <div className="flex items-center gap-2">
                    <StockBadge estoque={produto.estoque} />
                    <span className="text-sm text-muted-foreground">
                      ({produto.estoque} {produto.estoque === 1 ? "un." : "uns."})
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Vendedor</p>
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <StoreIcon className="size-4 text-muted-foreground" />
                    {produto.nomeVendedor}{" "}
                    <span className="text-xs text-muted-foreground">
                      (ID #{produto.idVendedor})
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-sm font-semibold">Descrição</h2>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {produto.descricao?.trim() || "Sem descrição informada."}
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">
                Avaliações do Produto{" "}
                {!loadingAvaliacoes && `(${avaliacoes.length})`}
              </h2>
              {mediaNota && (
                <div className="flex items-center gap-2 text-sm">
                  <Stars nota={Math.round(Number(mediaNota))} />
                  <span className="font-medium">{mediaNota} / 5</span>
                </div>
              )}
            </div>

            {loadingAvaliacoes ? (
              <div className="space-y-3" aria-busy="true">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : avaliacoes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <MessageSquareIcon className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Este produto ainda não possui avaliações.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {avaliacoes.map((av) => (
                  <Card key={av.id}>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{av.nomeCliente}</span>
                          <Stars nota={av.nota} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(av.dataAvaliacao)}
                        </span>
                      </div>
                      {av.comentario && (
                        <p className="text-sm text-muted-foreground">
                          {av.comentario}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <DeleteProductModal
            produto={confirmDelete ? produto : null}
            onOpenChange={setConfirmDelete}
            onDeleted={() => router.push("/produtos")}
          />
        </>
      )}
    </main>
  );
}
