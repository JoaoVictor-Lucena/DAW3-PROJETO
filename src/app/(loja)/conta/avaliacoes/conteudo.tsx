"use client";

import * as React from "react";
import Link from "next/link";
import { StarIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCarregar } from "@/hooks/useCarregar";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { avaliacaoService } from "@/services/avaliacaoService";
import type { Avaliacao } from "@/types";

function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Nota ${nota} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-4",
            i < nota ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default function MinhasAvaliacoesPage() {
  const [page, setPage] = React.useState(0);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);

  const { dados, erro, carregando, recarregar } = useCarregar(`minhas-avaliacoes-${page}`, () =>
    avaliacaoService.minhas(page),
  );

  const avaliacoes = dados?.content ?? [];

  function pedirExclusao(a: Avaliacao) {
    setConfirmacao({
      titulo: "Excluir avaliação?",
      descricao: `Sua avaliação para "${a.nomeProduto}" será removida permanentemente e deixará de compor a média do produto.`,
      acao: "Excluir Avaliação",
      destrutiva: true,
      executar: async () => {
        await avaliacaoService.remover(a.id);
        toast.success("Avaliação excluída com sucesso.");
        if (dados && dados.content.length <= 1 && page > 0) {
          setPage(page - 1);
        } else {
          recarregar();
        }
      },
    });
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Minhas Avaliações"
        descricao="Gerencie todas as avaliações e comentários que você enviou sobre produtos comprados."
      />

      <EstadoLista
        carregando={carregando}
        erro={erro}
        vazio={avaliacoes.length === 0}
        mensagemVazia="Você ainda não avaliou nenhum produto."
        onTentarDeNovo={recarregar}
      >
        <div className="space-y-4">
          <div className="grid gap-4">
            {avaliacoes.map((a) => (
              <Card key={a.id} className="transition-shadow hover:shadow-xs">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <Link
                          href={`/produtos/${a.idProduto}`}
                          className="font-medium text-base hover:text-primary transition-colors line-clamp-1"
                        >
                          {a.nomeProduto}
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Estrelas nota={a.nota} />
                        <span>•</span>
                        <time dateTime={a.dataAvaliacao}>{formatDateTime(a.dataAvaliacao)}</time>
                      </div>

                      <div className="pt-1">
                        {a.comentario ? (
                          <p className="text-sm text-foreground/90 whitespace-pre-line break-words">
                            {a.comentario}
                          </p>
                        ) : (
                          <p className="text-sm italic text-muted-foreground">
                            Avaliação enviada sem comentário em texto.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 pt-2 sm:pt-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        onClick={() => pedirExclusao(a)}
                      >
                        <Trash2Icon className="size-4" />
                        Excluir Avaliação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Paginacao page={dados} disabled={carregando} onChange={setPage} />
        </div>
      </EstadoLista>

      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </div>
  );
}
