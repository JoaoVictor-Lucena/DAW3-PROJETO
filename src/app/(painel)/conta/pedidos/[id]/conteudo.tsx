"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  BanIcon,
  CheckCircle2Icon,
  StarIcon,
  TruckIcon,
  Undo2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { METODOS } from "@/components/checkout/PassoPagamento";
import {
  AvaliarProdutoDialog,
  type ProdutoParaAvaliar,
} from "@/components/pedidos/AvaliarProdutoDialog";
import { EtapaBadge, etapaDoPedido } from "@/components/pedidos/EtapaBadge";
import { LinhaDoTempo } from "@/components/pedidos/LinhaDoTempo";
import { MiniaturaProduto } from "@/components/pedidos/MiniaturaProduto";
import { ProgressoEntrega } from "@/components/pedidos/ProgressoEntrega";
import { SolicitarDevolucaoDialog } from "@/components/pedidos/SolicitarDevolucaoDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAtualizarAoFocar } from "@/hooks/useAtualizarAoFocar";
import { useCarregar } from "@/hooks/useCarregar";
import { formatDate } from "@/lib/admin-labels";
import { formatBRL, formatDateTime } from "@/lib/format";
import { avaliacaoService } from "@/services/avaliacaoService";
import { pedidoService } from "@/services/pedidoService";
import type { Devolucao, EtapaPedido, Pedido, PodeAvaliar } from "@/types";

const STATUS_PAGAMENTO: Record<string, string> = {
  APROVADO: "Aprovado",
  PENDENTE: "Aguardando pagamento",
  RECUSADO: "Recusado",
  ESTORNADO: "Estornado",
};

/** Etapas em que o pedido saiu do fluxo normal: mostram um aviso no lugar da barra de progresso. */
const AVISOS: Partial<Record<EtapaPedido, { texto: string; destrutivo?: boolean }>> = {
  CANCELADO: { texto: "Este pedido foi cancelado.", destrutivo: true },
  PAGAMENTO_RECUSADO: { texto: "O pagamento deste pedido foi recusado.", destrutivo: true },
  DEVOLUCAO_SOLICITADA: { texto: "Você solicitou a devolução. Aguarde a análise do vendedor." },
  DEVOLUCAO_RECUSADA: { texto: "O vendedor recusou a devolução deste pedido." },
  DEVOLVIDO: { texto: "A devolução foi aprovada e o pedido foi devolvido." },
};

function podeCancelar(p: Pedido) {
  return (p.status === "CRIADO" || p.status === "CONFIRMADO") && !p.idEntrega && !p.statusEntrega;
}

function foiEntregue(p: Pedido) {
  return p.statusEntrega === "ENTREGUE";
}

/** O back-end aceita uma nova devolução só se não houver outra pendente ou aprovada. */
function podeDevolver(p: Pedido, devolucao: Devolucao | null) {
  return foiEntregue(p) && p.status !== "DEVOLVIDO" && (!devolucao || devolucao.status === "RECUSADA");
}

type Avaliaveis = { idPedido: number; porProduto: Record<number, PodeAvaliar> };

export default function DetalhePedidoPage() {
  const { id } = useParams<{ id: string }>();
  const idPedido = Number(id);

  const { dados, erro, carregando, recarregar } = useCarregar(`pedido-${idPedido}`, async () => {
    const [pedido, historico, devolucao] = await Promise.all([
      pedidoService.buscar(idPedido),
      pedidoService.historico(idPedido),
      pedidoService
        .devolucoesPorPedido()
        .then((porPedido) => porPedido[idPedido] ?? null)
        .catch(() => null),
    ]);
    return { pedido, historico, devolucao };
  });
  useAtualizarAoFocar(recarregar);

  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);
  const [devolvendo, setDevolvendo] = React.useState(false);
  const [avaliando, setAvaliando] = React.useState<ProdutoParaAvaliar | null>(null);
  const [avaliaveis, setAvaliaveis] = React.useState<Avaliaveis | null>(null);

  const pedido = dados?.pedido;
  const entregue = !!pedido && foiEntregue(pedido);
  const idsProdutos = pedido ? [...new Set(pedido.itens.map((i) => i.idProduto))].join(",") : "";

  // Depois da entrega, pergunta ao back-end quais produtos o cliente ainda pode avaliar.
  React.useEffect(() => {
    if (!entregue || !idsProdutos) return;
    let ativo = true;
    const ids = idsProdutos.split(",").map(Number);
    Promise.allSettled(ids.map((idProduto) => avaliacaoService.podeAvaliar(idProduto))).then(
      (resultados) => {
        if (!ativo) return;
        const porProduto: Record<number, PodeAvaliar> = {};
        resultados.forEach((r, i) => {
          if (r.status === "fulfilled") porProduto[ids[i]] = r.value;
        });
        setAvaliaveis({ idPedido, porProduto });
      },
    );
    return () => {
      ativo = false;
    };
  }, [entregue, idsProdutos, idPedido]);

  const avaliacoes = avaliaveis?.idPedido === idPedido ? avaliaveis.porProduto : {};

  function pedirCancelamento(p: Pedido) {
    setConfirmacao({
      titulo: `Cancelar o pedido #${p.id}?`,
      descricao:
        p.statusPagamento === "APROVADO"
          ? "O pagamento será estornado e os itens voltam para o estoque da loja."
          : "O pedido não será mais enviado. Esta ação não pode ser desfeita.",
      acao: "Cancelar pedido",
      voltar: "Manter pedido",
      destrutiva: true,
      executar: async () => {
        await pedidoService.cancelar(p.id);
        toast.success(`Pedido #${p.id} cancelado.`);
        recarregar();
      },
    });
  }

  const voltar = (
    <Link href="/conta/pedidos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
      <ArrowLeftIcon className="size-4" /> Meus pedidos
    </Link>
  );

  if (!pedido) {
    return (
      <>
        {voltar}
        <EstadoLista carregando={carregando} erro={erro} vazio onTentarDeNovo={recarregar}>
          {null}
        </EstadoLista>
      </>
    );
  }

  const devolucao = dados.devolucao;
  const etapa = etapaDoPedido(pedido, devolucao);
  const aviso = AVISOS[etapa];
  // Cancelado ou pagamento recusado: o pedido nem chegou a ser enviado, então não há progresso a mostrar.
  const foraDoFluxo = etapa === "CANCELADO" || etapa === "PAGAMENTO_RECUSADO";
  const historico = dados.historico;
  const alcancadas = [...historico.map((h) => h.etapa), etapa];
  const metodo = METODOS.find((m) => m.value === pedido.metodoPagamento)?.label ?? pedido.metodoPagamento;
  const endereco = pedido.enderecoEntrega;

  return (
    <>
      {voltar}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">Pedido #{pedido.id}</h1>
            <EtapaBadge pedido={pedido} devolucao={devolucao} />
          </div>
          <p className="text-sm text-muted-foreground">
            Feito em {formatDateTime(pedido.dataPedido)}
            {pedido.codigoCompra && (
              <>
                {" · compra "}
                <span className="font-mono">{pedido.codigoCompra}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {podeCancelar(pedido) && (
            <Button variant="outline" onClick={() => pedirCancelamento(pedido)}>
              <BanIcon /> Cancelar pedido
            </Button>
          )}
          {podeDevolver(pedido, devolucao) && (
            <Button variant="outline" onClick={() => setDevolvendo(true)}>
              <Undo2Icon /> Solicitar devolução
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {aviso && (
            <div
              className={
                aviso.destrutivo
                  ? "rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                  : "rounded-md bg-muted p-3 text-sm"
              }
            >
              <p>{aviso.texto}</p>
              {devolucao && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Solicitada em {formatDateTime(devolucao.dataDevolucao)} · Motivo: {devolucao.motivo}
                </p>
              )}
            </div>
          )}
          {!foraDoFluxo && <ProgressoEntrega alcancadas={alcancadas} />}

          {(pedido.codigoRastreamento || pedido.dataEntregaPrevista || pedido.dataEntrega) && (
            <div className="flex flex-wrap items-start gap-x-6 gap-y-2 rounded-md border p-3 text-sm">
              <TruckIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              {pedido.codigoRastreamento && (
                <div>
                  <p className="text-xs text-muted-foreground">Rastreio</p>
                  <p className="font-medium">
                    {pedido.transportadora && `${pedido.transportadora} · `}
                    <span className="font-mono">{pedido.codigoRastreamento}</span>
                  </p>
                </div>
              )}
              {pedido.dataEnvio && (
                <div>
                  <p className="text-xs text-muted-foreground">Enviado em</p>
                  <p className="font-medium">{formatDate(pedido.dataEnvio)}</p>
                </div>
              )}
              {pedido.dataEntrega ? (
                <div>
                  <p className="text-xs text-muted-foreground">Entregue em</p>
                  <p className="font-medium">{formatDate(pedido.dataEntrega)}</p>
                </div>
              ) : (
                pedido.dataEntregaPrevista && (
                  <div>
                    <p className="text-xs text-muted-foreground">Previsão de entrega</p>
                    <p className="font-medium">{formatDate(pedido.dataEntregaPrevista)}</p>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Itens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="divide-y rounded-lg border">
                {pedido.itens.map((item) => {
                  const avaliacao = avaliacoes[item.idProduto];
                  return (
                    <li key={item.idProduto} className="flex items-center gap-3 p-3 text-sm">
                      <MiniaturaProduto src={item.imagemUrl} className="size-12" />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/produtos/${item.idProduto}`}
                          className="block truncate font-medium hover:underline"
                        >
                          {item.nomeProduto}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {item.nomeVendedor} · {item.quantidade} × {formatBRL(item.precoUnitario)}
                        </span>
                        {entregue && avaliacao && (
                          <div className="mt-1">
                            {avaliacao.podeAvaliar ? (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() =>
                                  setAvaliando({ idProduto: item.idProduto, nomeProduto: item.nomeProduto })
                                }
                              >
                                <StarIcon /> Avaliar
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <CheckCircle2Icon className="size-3.5" />
                                {avaliacao.motivo ?? "Produto já avaliado."}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="shrink-0 font-medium">{formatBRL(item.subtotal)}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="grid grid-cols-2 gap-1 text-sm">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-right">{formatBRL(pedido.subtotal)}</dd>
                {!!pedido.valorDesconto && (
                  <>
                    <dt className="text-muted-foreground">
                      Desconto{pedido.codigoCupom && ` (${pedido.codigoCupom})`}
                    </dt>
                    <dd className="text-right text-emerald-600 dark:text-emerald-400">
                      − {formatBRL(pedido.valorDesconto)}
                    </dd>
                  </>
                )}
                <dt className="font-semibold">Total</dt>
                <dd className="text-right font-semibold">{formatBRL(pedido.valorTotal)}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linha do tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <LinhaDoTempo itens={historico} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endereço de entrega</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {endereco ? (
                <p>
                  {endereco.rua}, {endereco.numero}
                  {endereco.complemento && ` - ${endereco.complemento}`}
                  <br />
                  {endereco.cidade}/{endereco.estado} · CEP {endereco.cep}
                </p>
              ) : (
                <p>Sem endereço informado.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{metodo ?? "—"}</p>
              <p className="text-muted-foreground">
                {pedido.statusPagamento
                  ? (STATUS_PAGAMENTO[pedido.statusPagamento] ?? pedido.statusPagamento)
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
      <SolicitarDevolucaoDialog
        idPedido={pedido.id}
        aberto={devolvendo}
        onFechar={() => setDevolvendo(false)}
        onSolicitada={recarregar}
      />
      <AvaliarProdutoDialog
        produto={avaliando}
        onFechar={() => setAvaliando(null)}
        onAvaliado={(idProduto) =>
          setAvaliaveis((atual) =>
            atual && atual.idPedido === idPedido
              ? {
                  ...atual,
                  porProduto: {
                    ...atual.porProduto,
                    [idProduto]: { podeAvaliar: false, motivo: "Você já avaliou este produto." },
                  },
                }
              : atual,
          )
        }
      />
    </>
  );
}
