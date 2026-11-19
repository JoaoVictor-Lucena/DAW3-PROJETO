"use client";

import * as React from "react";
import Link from "next/link";
import { ShoppingCartIcon, StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { Estrelas } from "@/components/produtos/Estrelas";
import { MiniaturaProduto } from "@/components/pedidos/MiniaturaProduto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { BLOCKED_MESSAGE, useRequireAuth } from "@/hooks/useRequireAuth";
import { formatBRL } from "@/lib/format";
import { textoParcelamento } from "@/lib/parcelas";
import { getErrorMessage } from "@/services/api";
import type { Produto } from "@/types";

const ESTOQUE_BAIXO = 5;

function SeloEstoque({ estoque }: { estoque: number }) {
  if (estoque <= 0) {
    return <Badge variant="destructive">Esgotado</Badge>;
  }
  if (estoque <= ESTOQUE_BAIXO) {
    return (
      <Badge
        variant="outline"
        className="border-amber-500 text-amber-600 dark:text-amber-400"
      >
        Últimas {estoque} unidades
      </Badge>
    );
  }
  return null;
}

function BotaoCarrinho({ produto }: { produto: Produto }) {
  const { addItem } = useCart();
  const esgotado = produto.estoque <= 0;

  const adicionar = React.useCallback(async () => {
    try {
      await addItem(produto.id, 1, { nome: produto.nome, preco: produto.preco });
      toast.success("Item adicionado!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [addItem, produto.id, produto.nome, produto.preco]);

  const { requireAuth, isRoleBlocked } = useRequireAuth(adicionar);

  return (
    <Button
      type="button"
      className="w-full"
      disabled={esgotado || isRoleBlocked}
      title={isRoleBlocked ? BLOCKED_MESSAGE : undefined}
      onClick={() => requireAuth()}
      aria-label={`Adicionar ${produto.nome} ao carrinho`}
    >
      <ShoppingCartIcon /> {esgotado ? "Indisponível" : "Adicionar"}
    </Button>
  );
}

export function CardProdutoVitrine({
  produto,
  className,
}: {
  produto: Produto;
  className?: string;
}) {
  const parcelas = textoParcelamento(produto.preco);

  return (
    <Card className={className ?? "h-full gap-0 py-0"}>
      <Link
        href={`/produtos/${produto.id}`}
        className="group flex flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative">
          <MiniaturaProduto
            src={produto.imagemUrl ?? null}
            className="aspect-square w-full rounded-none"
          />
          <div className="absolute left-2 top-2">
            <SeloEstoque estoque={produto.estoque} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 group-hover:underline">
            {produto.nome}
          </h3>
          <Estrelas media={produto.mediaAvaliacoes} total={produto.totalAvaliacoes} />
          <div className="mt-auto pt-1">
            <p className="text-lg font-bold leading-tight">{formatBRL(produto.preco)}</p>
            {parcelas && <p className="text-xs text-muted-foreground">{parcelas} sem juros</p>}
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <StoreIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{produto.nomeVendedor}</span>
          </p>
        </div>
      </Link>

      <div className="p-3 pt-0">
        <BotaoCarrinho produto={produto} />
      </div>
    </Card>
  );
}

export function CardProdutoVitrineSkeleton() {
  return (
    <Card className="h-full gap-0 py-0" aria-hidden>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="p-3 pt-0">
        <Skeleton className="h-8 w-full" />
      </div>
    </Card>
  );
}
