"use client";

import * as React from "react";
import Link from "next/link";
import { PackageIcon, StoreIcon } from "lucide-react";

import { Estrelas } from "@/components/produtos/Estrelas";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { vendedorService } from "@/services/vendedorService";
import type { VendedorPublico } from "@/types";

interface CardVendedorProdutoProps {
  idVendedor: number;
  nomeVendedorFallback: string;
}

type ResultadoVendedor = { id: number; vendedor?: VendedorPublico; falhou?: boolean };

export function CardVendedorProduto({
  idVendedor,
  nomeVendedorFallback,
}: CardVendedorProdutoProps) {
  const [resultado, setResultado] = React.useState<ResultadoVendedor | null>(null);

  React.useEffect(() => {
    let cancelado = false;
    vendedorService
      .getVendedorPublico(idVendedor)
      .then((vendedor) => {
        if (!cancelado) setResultado({ id: idVendedor, vendedor });
      })
      .catch(() => {
        if (!cancelado) setResultado({ id: idVendedor, falhou: true });
      });
    return () => {
      cancelado = true;
    };
  }, [idVendedor]);

  const carregando = resultado?.id !== idVendedor;

  if (carregando) {
    return (
      <Card aria-busy="true" aria-label="Carregando informações do vendedor">
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 shrink-0" />
        </CardContent>
      </Card>
    );
  }

  const vendedor = resultado.vendedor;
  const nomeLoja = vendedor?.nome || nomeVendedorFallback;
  const inicial = nomeLoja.trim().charAt(0).toUpperCase();

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary"
              aria-hidden
            >
              {inicial || <StoreIcon className="size-5" />}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold">{nomeLoja}</p>
                {vendedor?.lojaAberta === false && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 text-amber-600 dark:text-amber-400"
                  >
                    Loja fechada temporariamente
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {vendedor && (
                  <Estrelas
                    media={vendedor.mediaAvaliacoes}
                    total={vendedor.totalAvaliacoes}
                  />
                )}
                {typeof vendedor?.totalProdutos === "number" && (
                  <span className="inline-flex items-center gap-1">
                    <PackageIcon className="size-3.5" aria-hidden />
                    {vendedor.totalProdutos}{" "}
                    {vendedor.totalProdutos === 1 ? "produto" : "produtos"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href={`/loja/${idVendedor}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <StoreIcon className="size-4" />
            Ver loja
          </Link>
        </div>

        {vendedor?.descricao && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{vendedor.descricao}</p>
        )}
      </CardContent>
    </Card>
  );
}
