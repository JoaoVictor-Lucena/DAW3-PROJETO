"use client";

import {
  ProductActions,
  ProductCard,
  type ProductActionProps,
} from "@/components/produtos/ProductCard";
import { StockBadge } from "@/components/produtos/StockBadge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBRL } from "@/lib/format";
import type { Produto } from "@/types";

interface Props extends ProductActionProps {
  produtos: Produto[];
}

/** Tabela no desktop (md+) e cards no mobile. */
export function ProductList({ produtos, canEdit, onDelete }: Props) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{p.nomeCategoria}</Badge>
                </TableCell>
                <TableCell>{p.nomeVendedor}</TableCell>
                <TableCell className="text-right">{formatBRL(p.preco)}</TableCell>
                <TableCell>
                  <StockBadge estoque={p.estoque} />
                </TableCell>
                <TableCell>
                  <ProductActions produto={p} canEdit={canEdit} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:hidden">
        {produtos.map((p) => (
          <ProductCard key={p.id} produto={p} canEdit={canEdit} onDelete={onDelete} />
        ))}
      </div>
    </>
  );
}

export function ProductListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Carregando produtos">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
