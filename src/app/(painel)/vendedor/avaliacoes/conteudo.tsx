"use client";

import * as React from "react";
import Link from "next/link";
import { StarIcon } from "lucide-react";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { Card, CardContent } from "@/components/ui/card";
import { useCarregar } from "@/hooks/useCarregar";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { painelVendedorService } from "@/services/painelVendedorService";

function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${nota} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn("size-4", i < nota ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default function VendedorAvaliacoesPage() {
  const [page, setPage] = React.useState(0);
  const { dados, erro, carregando, recarregar } = useCarregar(String(page), () =>
    painelVendedorService.avaliacoes(page),
  );
  const avaliacoes = dados?.content ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo="Avaliações recebidas"
        descricao="O que os clientes disseram sobre os produtos da sua loja, das mais recentes às mais antigas."
      />

      <EstadoLista
        carregando={carregando}
        erro={erro}
        vazio={avaliacoes.length === 0}
        mensagemVazia="Seus produtos ainda não foram avaliados."
        onTentarDeNovo={recarregar}
      >
        <div className="space-y-3">
          {avaliacoes.map((a) => (
            <Card key={a.id} size="sm">
              <CardContent className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/produtos/${a.idProduto}`} className="min-w-0 truncate font-medium hover:underline">
                    {a.nomeProduto}
                  </Link>
                  <Estrelas nota={a.nota} />
                </div>
                {a.comentario ? (
                  <p className="text-sm break-words">{a.comentario}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sem comentário.</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {a.nomeCliente} · {formatDateTime(a.dataAvaliacao)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </EstadoLista>

      <Paginacao page={dados} disabled={carregando} onChange={setPage} />
    </>
  );
}
