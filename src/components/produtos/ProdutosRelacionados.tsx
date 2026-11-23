"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import {
  CardProdutoVitrine,
  CardProdutoVitrineSkeleton,
} from "@/components/produtos/CardProdutoVitrine";
import { buttonVariants } from "@/components/ui/button";
import { Carrossel } from "@/components/vitrine/Carrossel";
import { produtoService } from "@/services/produtoService";
import type { Produto } from "@/types";

interface ProdutosRelacionadosProps {
  idProdutoAtual: number;
  idCategoria: number;
}

type ResultadoRelacionados = {
  chave: string;
  itens: Produto[];
};

export function ProdutosRelacionados({
  idProdutoAtual,
  idCategoria,
}: ProdutosRelacionadosProps) {
  const chave = `${idProdutoAtual}#${idCategoria}`;
  const [resultado, setResultado] = React.useState<ResultadoRelacionados | null>(null);

  React.useEffect(() => {
    let cancelado = false;
    produtoService
      .buscarVitrine({
        idCategoria,
        somenteComEstoque: true,
        size: 13,
      })
      .then((page) => {
        if (cancelado) return;
        const filtrados = page.content
          .filter((p) => p.id !== idProdutoAtual)
          .slice(0, 12);
        setResultado({ chave, itens: filtrados });
      })
      .catch(() => {
        if (!cancelado) setResultado({ chave, itens: [] });
      });
    return () => {
      cancelado = true;
    };
  }, [chave, idCategoria, idProdutoAtual]);

  const carregando = resultado?.chave !== chave;

  if (carregando) {
    return (
      <section className="space-y-4" aria-busy="true" aria-label="Carregando produtos relacionados">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Produtos relacionados</h2>
        </div>
        <Carrossel ariaLabel="Produtos relacionados">
          {Array.from({ length: 4 }, (_, i) => (
            <CardProdutoVitrineSkeleton key={i} />
          ))}
        </Carrossel>
      </section>
    );
  }

  if (resultado.itens.length === 0) return null;

  return (
    <section className="space-y-4" aria-label="Produtos relacionados">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Produtos relacionados</h2>
        <Link
          href={`/categoria/${idCategoria}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Ver categoria <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <Carrossel ariaLabel="Produtos relacionados">
        {resultado.itens.map((item) => (
          <CardProdutoVitrine key={item.id} produto={item} />
        ))}
      </Carrossel>
    </section>
  );
}
