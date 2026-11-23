"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRightIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { BotaoFavorito } from "@/components/produtos/BotaoFavorito";
import { CardVendedorProduto } from "@/components/produtos/CardVendedorProduto";
import { DeleteProductModal } from "@/components/produtos/DeleteProductModal";
import { Estrelas } from "@/components/produtos/Estrelas";
import { GaleriaProduto } from "@/components/produtos/GaleriaProduto";
import { ProdutosRelacionados } from "@/components/produtos/ProdutosRelacionados";
import { AddToCartButton, BuyNowButton } from "@/components/produtos/PurchaseButtons";
import { SecaoAvaliacoesProduto } from "@/components/produtos/SecaoAvaliacoesProduto";
import { StockBadge } from "@/components/produtos/StockBadge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { formatBRL } from "@/lib/format";
import { textoParcelamento } from "@/lib/parcelas";
import { getErrorMessage } from "@/services/api";
import { produtoService } from "@/services/produtoService";
import type { AvaliacaoResumo, Produto } from "@/types";

type ProdutoResult = { id: string; produto?: Produto; error?: string };

function DetalheProdutoSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Carregando produto">
      <Skeleton className="h-5 w-64" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="size-16 rounded-lg sm:size-20" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}

function BlocoCompra({
  produto,
  resumoAvaliacoes,
}: {
  produto: Produto;
  resumoAvaliacoes: AvaliacaoResumo | null;
}) {
  const esgotado = produto.estoque <= 0;
  const maxQuantidade = Math.max(1, produto.estoque);
  const [quantidade, setQuantidade] = React.useState(1);
  const [textoQuantidade, setTextoQuantidade] = React.useState("1");

  const parcelas = textoParcelamento(produto.preco);
  const mediaExibida = resumoAvaliacoes ? resumoAvaliacoes.media : produto.mediaAvaliacoes;
  const totalExibido = resumoAvaliacoes ? resumoAvaliacoes.total : produto.totalAvaliacoes;

  function alterarQuantidade(valor: number) {
    if (esgotado) return;
    const ajustado = Math.min(maxQuantidade, Math.max(1, valor));
    setQuantidade(ajustado);
    setTextoQuantidade(String(ajustado));
  }

  function handleInputQuantidade(e: React.ChangeEvent<HTMLInputElement>) {
    if (esgotado) return;
    const digitos = e.target.value.replace(/\D/g, "");
    if (!digitos) {
      setTextoQuantidade("");
      return;
    }
    alterarQuantidade(Number(digitos));
  }

  function handleBlurQuantidade() {
    if (!textoQuantidade || textoQuantidade !== String(quantidade)) {
      setTextoQuantidade(String(quantidade));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/categoria/${produto.idCategoria}`}>
          <Badge variant="secondary" className="hover:bg-secondary/80">
            {produto.nomeCategoria}
          </Badge>
        </Link>
        <BotaoFavorito idProduto={produto.id} nome={produto.nome} comTexto />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{produto.nome}</h1>
        <Estrelas media={mediaExibida} total={totalExibido} />
      </div>

      <div className="space-y-1 rounded-xl border bg-muted/30 p-4">
        <p className="text-3xl font-bold">{formatBRL(produto.preco)}</p>
        {parcelas && (
          <p className="text-sm text-muted-foreground">{parcelas} sem juros</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <StockBadge estoque={produto.estoque} />
          {!esgotado && (
            <span className="text-sm text-muted-foreground">
              {produto.estoque}{" "}
              {produto.estoque === 1 ? "unidade disponível" : "unidades disponíveis"}
            </span>
          )}
        </div>
        {esgotado && (
          <p className="text-sm font-medium text-destructive">
            Produto temporariamente esgotado e indisponível para compra.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantidade-produto">Quantidade</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Diminuir quantidade"
            disabled={esgotado || quantidade <= 1}
            onClick={() => alterarQuantidade(quantidade - 1)}
          >
            <MinusIcon className="size-4" />
          </Button>
          <Input
            id="quantidade-produto"
            type="text"
            inputMode="numeric"
            aria-label="Quantidade"
            value={textoQuantidade}
            disabled={esgotado}
            onChange={handleInputQuantidade}
            onBlur={handleBlurQuantidade}
            className="w-20 text-center"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Aumentar quantidade"
            disabled={esgotado || quantidade >= maxQuantidade}
            onClick={() => alterarQuantidade(quantidade + 1)}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <AddToCartButton
          produtoId={produto.id}
          quantidade={quantidade}
          disabled={esgotado}
        />
        <BuyNowButton
          produtoId={produto.id}
          quantidade={quantidade}
          disabled={esgotado}
        />
      </div>

      <CardVendedorProduto
        key={produto.idVendedor}
        idVendedor={produto.idVendedor}
        nomeVendedorFallback={produto.nomeVendedor}
      />
    </div>
  );
}

export default function DetalheProdutoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "VENDEDOR";

  const [result, setResult] = React.useState<ProdutoResult | null>(null);
  const [resumoEstado, setResumoEstado] = React.useState<{
    id: number;
    resumo: AvaliacaoResumo;
  } | null>(null);
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

    return () => {
      cancelled = true;
    };
  }, [id]);

  const loading = result?.id !== id;
  const produto = !loading ? result?.produto : undefined;
  const resumoAtual =
    produto && resumoEstado?.id === produto.id ? resumoEstado.resumo : null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8">
      {loading ? (
        <DetalheProdutoSkeleton />
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground hover:underline">
                    Início
                  </Link>
                </li>
                <li aria-hidden>
                  <ChevronRightIcon className="size-4" />
                </li>
                <li>
                  <Link
                    href={`/categoria/${produto.idCategoria}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {produto.nomeCategoria}
                  </Link>
                </li>
                <li aria-hidden>
                  <ChevronRightIcon className="size-4" />
                </li>
                <li
                  aria-current="page"
                  className="max-w-xs truncate font-medium text-foreground sm:max-w-md"
                >
                  {produto.nome}
                </li>
              </ol>
            </nav>

            {canEdit && (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/produtos/${produto.id}/editar`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <PencilIcon /> Editar Produto
                </Link>
                <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2Icon /> Excluir Produto
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <GaleriaProduto
              key={produto.id}
              nome={produto.nome}
              imagemUrl={produto.imagemUrl}
              imagens={produto.imagens}
            />
            <BlocoCompra
              key={produto.id}
              produto={produto}
              resumoAvaliacoes={resumoAtual}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {produto.descricao?.trim() || "Sem descrição informada."}
              </p>
            </CardContent>
          </Card>

          <SecaoAvaliacoesProduto
            key={produto.id}
            idProduto={produto.id}
            onResumoAtualizado={(resumo) =>
              setResumoEstado({ id: produto.id, resumo })
            }
          />

          <ProdutosRelacionados
            key={`${produto.id}-${produto.idCategoria}`}
            idProdutoAtual={produto.id}
            idCategoria={produto.idCategoria}
          />

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
