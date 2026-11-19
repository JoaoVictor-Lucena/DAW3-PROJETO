"use client";

import * as React from "react";
import Link from "next/link";
import { CheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Abas } from "@/components/admin/Abas";
import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAtualizarAoFocar } from "@/hooks/useAtualizarAoFocar";
import { useCarregar } from "@/hooks/useCarregar";
import { formatBRL, formatDateTime } from "@/lib/format";
import { painelVendedorService } from "@/services/painelVendedorService";
import type { Devolucao, StatusDevolucao } from "@/types";

type Filtro = StatusDevolucao | "TODAS";

const ABAS: { value: Filtro; label: string }[] = [
  { value: "PENDENTE", label: "Para analisar" },
  { value: "APROVADA", label: "Aprovadas" },
  { value: "RECUSADA", label: "Recusadas" },
  { value: "TODAS", label: "Todas" },
];

const STATUS: Record<StatusDevolucao, { rotulo: string; classe: string }> = {
  PENDENTE: { rotulo: "Pendente", classe: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  APROVADA: { rotulo: "Aprovada", classe: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  RECUSADA: { rotulo: "Recusada", classe: "bg-muted text-muted-foreground" },
};

export default function VendedorDevolucoesPage() {
  const [filtro, setFiltro] = React.useState<Filtro>("PENDENTE");
  const [page, setPage] = React.useState(0);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);

  const filtros = { status: filtro === "TODAS" ? undefined : filtro, page };
  const { dados, erro, carregando, recarregar } = useCarregar(JSON.stringify(filtros), () =>
    painelVendedorService.devolucoes(filtros),
  );
  useAtualizarAoFocar(recarregar);

  function responder(d: Devolucao, aprovar: boolean) {
    setConfirmacao(
      aprovar
        ? {
            titulo: `Aprovar a devolução do pedido #${d.idPedido}?`,
            descricao: `Os itens voltam para o estoque e ${formatBRL(d.valorPedido)} é estornado para ${d.nomeCliente}.`,
            acao: "Aprovar devolução",
            executar: async () => {
              await painelVendedorService.aprovarDevolucao(d.id);
              toast.success(`Devolução do pedido #${d.idPedido} aprovada.`);
              recarregar();
            },
          }
        : {
            titulo: `Recusar a devolução do pedido #${d.idPedido}?`,
            descricao: "O cliente verá que a devolução foi recusada e poderá abrir uma nova solicitação.",
            acao: "Recusar devolução",
            destrutiva: true,
            executar: async () => {
              await painelVendedorService.rejeitarDevolucao(d.id);
              toast.success(`Devolução do pedido #${d.idPedido} recusada.`);
              recarregar();
            },
          },
    );
  }

  const devolucoes = dados?.content ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo="Devoluções"
        descricao="Pedidos da sua loja que os clientes pediram para devolver."
        acoes={
          <Abas
            abas={ABAS}
            ativa={filtro}
            ariaLabel="Status da devolução"
            onChange={(v) => {
              setFiltro(v);
              setPage(0);
            }}
          />
        }
      />

      <EstadoLista
        carregando={carregando}
        erro={erro}
        vazio={devolucoes.length === 0}
        mensagemVazia={filtro === "PENDENTE" ? "Nenhuma devolução esperando análise." : "Nenhuma devolução aqui."}
        onTentarDeNovo={recarregar}
      >
        <div className="space-y-3">
          {devolucoes.map((d) => (
            <Card key={d.id} size="sm">
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/vendedor/pedidos/${d.idPedido}`} className="font-medium hover:underline">
                      Pedido #{d.idPedido}
                    </Link>
                    <Badge variant="secondary" className={STATUS[d.status].classe}>
                      {STATUS[d.status].rotulo}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {d.nomeCliente} · {formatDateTime(d.dataDevolucao)} · {formatBRL(d.valorPedido)}
                  </p>
                  <p className="text-sm break-words">
                    <span className="text-muted-foreground">Motivo: </span>
                    {d.motivo}
                  </p>
                </div>
                {d.status === "PENDENTE" && (
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => responder(d, false)}>
                      <XIcon /> Recusar
                    </Button>
                    <Button size="sm" onClick={() => responder(d, true)}>
                      <CheckIcon /> Aprovar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </EstadoLista>

      <Paginacao page={dados} disabled={carregando} onChange={setPage} />

      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </>
  );
}
