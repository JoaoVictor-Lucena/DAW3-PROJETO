"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  PackageCheckIcon,
  RotateCcwIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { EtapaBadge } from "@/components/pedidos/EtapaBadge";
import { MiniaturaProduto } from "@/components/pedidos/MiniaturaProduto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAtualizarAoFocar } from "@/hooks/useAtualizarAoFocar";
import { useCarregar } from "@/hooks/useCarregar";
import { formatBRL, formatDateTime } from "@/lib/format";
import { ApiError, getErrorMessage } from "@/services/api";
import { devolucaoService } from "@/services/devolucaoService";
import type { Devolucao, Pedido } from "@/types";

const MAX_MOTIVO = 1000;

const STATUS_BADGE: Record<
  string,
  { rotulo: string; classe: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  PENDENTE: {
    rotulo: "Em análise",
    classe: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    Icon: ClockIcon,
  },
  EM_ANALISE: {
    rotulo: "Em análise",
    classe: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    Icon: ClockIcon,
  },
  APROVADA: {
    rotulo: "Aprovada",
    classe: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    Icon: CheckCircle2Icon,
  },
  RECUSADA: {
    rotulo: "Recusada",
    classe: "bg-destructive/10 text-destructive dark:bg-destructive/20",
    Icon: XCircleIcon,
  },
  REJEITADA: {
    rotulo: "Recusada",
    classe: "bg-destructive/10 text-destructive dark:bg-destructive/20",
    Icon: XCircleIcon,
  },
};

function resumoItensPedido(pedido: Pedido): { texto: string; lojas: string; quantidade: number } {
  const lojas = [...new Set(pedido.itens.map((i) => i.nomeVendedor))].join(", ");
  const quantidade = pedido.itens.reduce((acc, i) => acc + i.quantidade, 0);
  const nomes = pedido.itens.map((i) => i.nomeProduto);
  const texto =
    nomes.length > 2 ? `${nomes.slice(0, 2).join(", ")} e mais ${nomes.length - 2}` : nomes.join(", ");
  return { texto, lojas, quantidade };
}

function SolicitarDevolucaoForm({
  pedido,
  onFechar,
  onSolicitada,
}: {
  pedido: Pedido;
  onFechar: () => void;
  onSolicitada: () => void;
}) {
  const [motivo, setMotivo] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const texto = motivo.trim();
    if (!texto) {
      setErro("Informe o motivo da solicitação de devolução.");
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      await devolucaoService.solicitar({
        idPedido: pedido.id,
        motivo: texto,
      });
      toast.success(`Devolução do pedido #${pedido.id} solicitada com sucesso!`);
      onSolicitada();
      onFechar();
    } catch (error) {
      const erroCampo = error instanceof ApiError ? error.erros.motivo : undefined;
      if (erroCampo) {
        setErro(erroCampo);
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setEnviando(false);
    }
  }

  const { texto: resumoItens } = resumoItensPedido(pedido);

  return (
    <>
      <form id="form-solicitar-devolucao" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
          <div className="flex items-center justify-between font-medium">
            <span>Pedido #{pedido.id}</span>
            <span>{formatBRL(pedido.valorTotal)}</span>
          </div>
          {resumoItens && <p className="truncate text-xs text-muted-foreground">{resumoItens}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="motivo-devolucao">Motivo da devolução</Label>
          <Textarea
            id="motivo-devolucao"
            placeholder="Descreva o motivo da devolução (ex.: produto com defeito, item diferente do pedido...)"
            rows={4}
            maxLength={MAX_MOTIVO}
            value={motivo}
            disabled={enviando}
            aria-invalid={!!erro}
            onChange={(e) => {
              setMotivo(e.target.value);
              if (erro) setErro(null);
            }}
          />
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-destructive">{erro}</span>
            <span className="text-muted-foreground">
              {motivo.length}/{MAX_MOTIVO}
            </span>
          </div>
        </div>
      </form>

      <DialogFooter>
        <Button type="button" variant="outline" disabled={enviando} onClick={onFechar}>
          Cancelar
        </Button>
        <Button type="submit" form="form-solicitar-devolucao" disabled={enviando}>
          {enviando && <Loader2Icon className="size-4 animate-spin" />}
          Enviar Solicitação
        </Button>
      </DialogFooter>
    </>
  );
}

export default function DevolucoesClientePage() {
  const [pedidoSelecionado, setPedidoSelecionado] = React.useState<Pedido | null>(null);

  const { dados, erro, carregando, recarregar } = useCarregar("conta-devolucoes", async () => {
    const [pedidos, devolucoes] = await Promise.all([
      devolucaoService.listarTodosPedidosCliente(),
      devolucaoService.listarTodasMinhas(),
    ]);
    return { pedidos, devolucoes };
  });

  useAtualizarAoFocar(recarregar);

  const pedidos = React.useMemo(() => dados?.pedidos ?? [], [dados]);
  const devolucoes = React.useMemo(() => dados?.devolucoes ?? [], [dados]);

  // Mapa de pedidos por ID para enriquecer a exibição das devoluções
  const pedidosPorId = React.useMemo(() => {
    const mapa = new Map<number, Pedido>();
    for (const p of pedidos) {
      mapa.set(p.id, p);
    }
    return mapa;
  }, [pedidos]);

  // Pedidos elegíveis: entregues e que ainda não possuem devolução solicitada
  const pedidosElegiveis = React.useMemo(() => {
    const idsComDevolucao = new Set(devolucoes.map((d) => d.idPedido));
    return pedidos.filter((p) => {
      const entregue = p.statusEntrega === "ENTREGUE" || p.etapaAtual === "ENTREGUE";
      const jaTemDevolucao = idsComDevolucao.has(p.id) || Boolean(p.idDevolucao);
      return entregue && p.status !== "DEVOLVIDO" && p.status !== "CANCELADO" && !jaTemDevolucao;
    });
  }, [pedidos, devolucoes]);

  return (
    <div className="space-y-8">
      <CabecalhoPagina
        titulo="Devoluções"
        descricao="Solicite a devolução de pedidos entregues e acompanhe o status das suas solicitações."
      />

      <EstadoLista
        carregando={carregando && !dados}
        erro={erro}
        vazio={false}
        onTentarDeNovo={recarregar}
      >
        <div className="space-y-8">
          {/* Seção 1: Pedidos Elegíveis */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <PackageCheckIcon className="size-5 text-primary" />
                Pedidos Elegíveis para Devolução
              </h2>
              <p className="text-sm text-muted-foreground">
                Pedidos já entregues que ainda não tiveram devolução solicitada.
              </p>
            </div>

            {pedidosElegiveis.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <PackageCheckIcon className="size-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  Nenhum pedido entregue disponível para solicitação de devolução no momento.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {pedidosElegiveis.map((pedido) => {
                  const primeiro = pedido.itens[0];
                  const { texto, lojas, quantidade } = resumoItensPedido(pedido);

                  return (
                    <Card key={pedido.id}>
                      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <MiniaturaProduto src={primeiro?.imagemUrl ?? null} className="size-14 shrink-0" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/conta/pedidos/${pedido.id}`}
                                className="font-semibold hover:text-primary hover:underline"
                              >
                                Pedido #{pedido.id}
                              </Link>
                              <EtapaBadge pedido={pedido} />
                            </div>
                            <p className="truncate text-sm text-muted-foreground">{texto}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              Entregue em {formatDateTime(pedido.dataEntrega ?? pedido.dataPedido)} ·{" "}
                              {lojas} · {quantidade} {quantidade === 1 ? "item" : "itens"} ·{" "}
                              <span className="font-medium text-foreground">
                                {formatBRL(pedido.valorTotal)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => setPedidoSelecionado(pedido)}
                          >
                            <RotateCcwIcon className="size-4" />
                            Solicitar Devolução
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Seção 2: Minhas Devoluções */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <RotateCcwIcon className="size-5 text-primary" />
                Minhas Devoluções
              </h2>
              <p className="text-sm text-muted-foreground">
                Histórico e status atual das solicitações de devolução que você enviou.
              </p>
            </div>

            {devolucoes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <RotateCcwIcon className="size-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  Você ainda não possui nenhuma solicitação de devolução registrada.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {devolucoes.map((d: Devolucao) => {
                  const infoStatus = STATUS_BADGE[d.status] ?? {
                    rotulo: d.status,
                    codigo: d.status,
                    classe: "bg-muted text-muted-foreground",
                    Icon: ClockIcon,
                  };
                  const StatusIcon = infoStatus.Icon;
                  const pedidoAssociado = pedidosPorId.get(d.idPedido);
                  const resumo = pedidoAssociado ? resumoItensPedido(pedidoAssociado) : null;

                  return (
                    <Card key={d.id}>
                      <CardContent className="space-y-2.5 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/conta/pedidos/${d.idPedido}`}
                              className="font-semibold hover:text-primary hover:underline"
                            >
                              Pedido #{d.idPedido}
                            </Link>
                            <Badge variant="secondary" className={infoStatus.classe}>
                              <StatusIcon className="mr-1 size-3.5" />
                              {infoStatus.rotulo}
                            </Badge>
                          </div>
                          <span className="text-sm font-semibold">{formatBRL(d.valorPedido)}</span>
                        </div>

                        {resumo && (
                          <p className="truncate text-xs text-muted-foreground">
                            {resumo.texto} · {resumo.lojas}
                          </p>
                        )}

                        <p className="text-sm break-words">
                          <span className="font-medium text-muted-foreground">Motivo: </span>
                          {d.motivo}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Solicitada em {formatDateTime(d.dataDevolucao)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </EstadoLista>

      {/* Dialog para Solicitar Devolução */}
      <Dialog
        open={pedidoSelecionado !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setPedidoSelecionado(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Devolução</DialogTitle>
            <DialogDescription>
              Explique o motivo da devolução. O vendedor analisará sua solicitação.
            </DialogDescription>
          </DialogHeader>
          {pedidoSelecionado && (
            <SolicitarDevolucaoForm
              key={pedidoSelecionado.id}
              pedido={pedidoSelecionado}
              onFechar={() => setPedidoSelecionado(null)}
              onSolicitada={recarregar}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
