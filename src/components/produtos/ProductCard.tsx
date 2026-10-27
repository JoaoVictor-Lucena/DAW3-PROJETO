"use client";

import Link from "next/link";
import { EyeIcon, Trash2Icon } from "lucide-react";

import { StockBadge } from "@/components/produtos/StockBadge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";
import type { Produto } from "@/types";

export interface ProductActionProps {
  canEdit: boolean;
  onDelete: (produto: Produto) => void;
}

export function ProductActions({
  produto,
  canEdit,
  onDelete,
}: ProductActionProps & { produto: Produto }) {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/produtos/${produto.id}`}
        className={buttonVariants({ variant: "outline", size: "sm" })}
        aria-label={`Ver detalhes de ${produto.nome}`}
      >
        <EyeIcon /> Ver
      </Link>
      {canEdit && (
        <Button
          variant="destructive"
          size="sm"
          aria-label={`Excluir ${produto.nome}`}
          onClick={() => onDelete(produto)}
        >
          <Trash2Icon /> Excluir
        </Button>
      )}
    </div>
  );
}

export function ProductCard({
  produto,
  canEdit,
  onDelete,
}: ProductActionProps & { produto: Produto }) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{produto.nome}</h3>
          <Badge variant="secondary">{produto.nomeCategoria}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Vendedor: {produto.nomeVendedor}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{formatBRL(produto.preco)}</span>
          <StockBadge estoque={produto.estoque} />
        </div>
        <ProductActions produto={produto} canEdit={canEdit} onDelete={onDelete} />
      </CardContent>
    </Card>
  );
}
