"use client";

import * as React from "react";
import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { BotaoFavorito } from "@/components/produtos/BotaoFavorito";
import { StockBadge } from "@/components/produtos/StockBadge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFavoritos } from "@/context/FavoritosContext";
import { useCarregar } from "@/hooks/useCarregar";
import { formatBRL } from "@/lib/format";
import { favoritoService } from "@/services/favoritoService";
import type { Produto } from "@/types";

function CardFavorito({ produto }: { produto: Produto }) {
  const indisponivel = produto.ativo === false;
  return (
    <Card className="overflow-hidden pt-0">
      <Link href={`/produtos/${produto.id}`} className="relative block aspect-square bg-muted">
        {produto.imagemUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.imagemUrl}
            alt={produto.nome}
            loading="lazy"
            className={indisponivel ? "size-full object-cover opacity-50 grayscale" : "size-full object-cover"}
          />
        ) : null}
        {indisponivel && (
          <Badge variant="secondary" className="absolute left-2 top-2">
            Indisponível
          </Badge>
        )}
      </Link>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/produtos/${produto.id}`}
            className="line-clamp-2 font-medium leading-tight hover:underline"
          >
            {produto.nome}
          </Link>
          <BotaoFavorito idProduto={produto.id} nome={produto.nome} className="size-8 shrink-0" />
        </div>
        <p className="text-xs text-muted-foreground">{produto.nomeVendedor}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold">{formatBRL(produto.preco)}</span>
          {!indisponivel && <StockBadge estoque={produto.estoque} />}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FavoritosPage() {
  const { versao } = useFavoritos();
  const [page, setPage] = React.useState(0);
  const { dados, erro, carregando, recarregar } = useCarregar(`${page}#${versao}`, () =>
    favoritoService.listar(page),
  );

  // Se o último item da página foi removido, volta uma página (ajuste de estado durante o render).
  if (!carregando && page > 0 && dados?.content.length === 0) {
    setPage(page - 1);
  }

  const produtos = dados?.content ?? [];

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Lista de desejos</h1>
        <p className="text-sm text-muted-foreground">Produtos que você salvou para comprar depois.</p>
      </div>

      {!carregando && !erro && produtos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <HeartIcon className="size-10 text-muted-foreground" />
          <p className="font-medium">Sua lista de desejos está vazia</p>
          <p className="text-sm text-muted-foreground">
            Toque no coração de um produto para salvá-lo aqui.
          </p>
          <Link href="/produtos" className={buttonVariants({ variant: "outline" })}>
            Explorar produtos
          </Link>
        </div>
      ) : (
        <EstadoLista
          carregando={carregando}
          erro={erro}
          vazio={produtos.length === 0}
          onTentarDeNovo={recarregar}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {produtos.map((p) => (
              <CardFavorito key={p.id} produto={p} />
            ))}
          </div>
        </EstadoLista>
      )}

      <Paginacao page={dados} disabled={carregando} onChange={setPage} />
    </>
  );
}
