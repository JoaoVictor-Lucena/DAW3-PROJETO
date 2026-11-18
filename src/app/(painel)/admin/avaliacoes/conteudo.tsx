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
import { useCarregar } from "@/hooks/useCarregar";
import { formatDateTime } from "@/lib/format";
import { adminService } from "@/services/adminService";
import type { Avaliacao } from "@/types";

function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="inline-flex" aria-label={`Nota ${nota} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={i < nota ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-muted-foreground/40"}
        />
      ))}
    </span>
  );
}

export default function AdminAvaliacoesPage() {
  const [page, setPage] = React.useState(0);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);
  const { dados, erro, carregando, recarregar } = useCarregar(String(page), () =>
    adminService.avaliacoes(page),
  );

  function pedirRemocao(a: Avaliacao) {
    setConfirmacao({
      titulo: "Remover esta avaliação?",
      descricao: `A avaliação de ${a.nomeCliente} sobre "${a.nomeProduto}" será apagada e deixa de contar na média do produto. Esta ação não pode ser desfeita.`,
      acao: "Remover",
      destrutiva: true,
      executar: async () => {
        await adminService.removerAvaliacao(a.id);
        toast.success("Avaliação removida.");
        if (dados && dados.content.length <= 1 && page > 0) setPage(page - 1);
        else recarregar();
      },
    });
  }

  const avaliacoes = dados?.content ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo="Avaliações"
        descricao="Moderação: remova avaliações ofensivas ou que não tenham relação com o produto."
      />

      <EstadoLista
        carregando={carregando}
        erro={erro}
        vazio={avaliacoes.length === 0}
        mensagemVazia="Nenhuma avaliação até agora."
        onTentarDeNovo={recarregar}
      >
        <ul className="space-y-3">
          {avaliacoes.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg border p-4">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Estrelas nota={a.nota} />
                  <Link href={`/produtos/${a.idProduto}`} className="text-sm font-medium hover:underline">
                    {a.nomeProduto}
                  </Link>
                </div>
                <p className="text-sm">
                  {a.comentario || <span className="italic text-muted-foreground">Sem comentário.</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.nomeCliente} · {formatDateTime(a.dataAvaliacao)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:text-destructive"
                aria-label={`Remover avaliação de ${a.nomeCliente}`}
                onClick={() => pedirRemocao(a)}
              >
                <Trash2Icon />
              </Button>
            </li>
          ))}
        </ul>
      </EstadoLista>

      <Paginacao page={dados} disabled={carregando} onChange={setPage} />
      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </>
  );
}
