"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, TruckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { METODOS } from "@/components/checkout/PassoPagamento";
import { EtapaBadge, etapaDoPedido } from "@/components/pedidos/EtapaBadge";
import { LinhaDoTempo } from "@/components/pedidos/LinhaDoTempo";
import { MiniaturaProduto } from "@/components/pedidos/MiniaturaProduto";
import { ProgressoEntrega } from "@/components/pedidos/ProgressoEntrega";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACAO_DA_ETAPA, aguardaVendedor } from "@/components/vendedor/acoesPedido";
import { AvancarPedidoDialog } from "@/components/vendedor/AvancarPedidoDialog";
import { useAtualizarAoFocar } from "@/hooks/useAtualizarAoFocar";
import { useCarregar } from "@/hooks/useCarregar";
import { formatDate } from "@/lib/admin-labels";
import { formatBRL, formatDateTime } from "@/lib/format";
import { painelVendedorService } from "@/services/painelVendedorService";
import { devolucaoDoPedido, type DevolucaoDoPedido, type EtapaPedido, type Pedido } from "@/types";

const STATUS_PAGAMENTO: Record<string, string> = {
  APROVADO: "Aprovado",
  PENDENTE: "Aguardando confirmação",
  RECUSADO: "Recusado",
  ESTORNADO: "Estornado",
};

const AVISOS: Partial<Record<EtapaPedido, { texto: string; destrutivo?: boolean }>> = {
  PEDIDO_CRIADO: { texto: "O cliente ainda não concluiu o pagamento deste pedido." },
  CANCELADO: { texto: "Este pedido foi cancelado.", destrutivo: true },
  PAGAMENTO_RECUSADO: { texto: "O pagamento deste pedido foi recusado.", destrutivo: true },
  DEVOLUCAO_SOLICITADA: { texto: "O cliente pediu a devolução deste pedido. Analise e responda." },
  DEVOLUCAO_RECUSADA: { texto: "Você recusou a devolução deste pedido." },
  DEVOLVIDO: { texto: "A devolução foi aprovada: o estoque voltou e o pagamento foi estornado." },
};

export default function VendedorPedidoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const idPedido = Number(id);

  const { dados, erro, carregando, recarregar } = useCarregar(`vendedor-pedido-${idPedido}`, async () => {
    const [pedido, historico] = await Promise.all([
      painelVendedorService.pedido(idPedido),
      painelVendedorService.historico(idPedido),
    ]);
    return { pedido, historico };
  });
  useAtualizarAoFocar(recarregar);

  const [avancando, setAvancando] = React.useState<Pedido | null>(null);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);

  function responderDevolucao(p: Pedido, d: DevolucaoDoPedido, aprovar: boolean) {
    setConfirmacao(
      aprovar
        ? {
            titulo: `Aprovar a devolução do pedido #${p.id}?`,
            descricao: `Os itens voltam para o estoque e ${formatBRL(p.valorTotal)} é estornado ao cliente.`,
            acao: "Aprovar devolução",
            executar: async () => {
              await painelVendedorService.aprovarDevolucao(d.id);
              toast.success("Devolução aprovada.");
              recarregar();
            },
          }
        : {
            titulo: `Recusar a devolução do pedido #${p.id}?`,
            descricao: "O cliente verá que a devolução foi recusada e poderá abrir uma nova solicitação.",
            acao: "Recusar devolução",
            destrutiva: true,
            executar: async () => {
              await painelVendedorService.rejeitarDevolucao(d.id);
              toast.success("Devolução recusada.");
              recarregar();
            },
          },
    );
  }

  const voltar = (
    <Link href="/vendedor/pedidos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
      <ArrowLeftIcon className="size-4" /> Pedidos recebidos
    </Link>
  );

  const pedido = dados?.pedido;
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

  const { historico } = dados;
  const devolucao = devolucaoDoPedido(pedido);
  const etapa = etapaDoPedido(pedido);
  const aviso = AVISOS[etapa];
  const foraDoFluxo = etapa === "CANCELADO" || etapa === "PAGAMENTO_RECUSADO" || etapa === "PEDIDO_CRIADO";
  const alcancadas = [...historico.map((h) => h.etapa), etapa];
  const metodo = METODOS.find((m) => m.value === pedido.metodoPagamento)?.label ?? pedido.metodoPagamento;
  const endereco = pedido.enderecoEntrega;
  const devolucaoPendente = devolucao?.status === "PENDENTE" ? devolucao : null;
  const podeAvancar = !devolucaoPendente && aguardaVendedor(pedido);

  return (
    <>
      {voltar}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">Pedido #{pedido.id}</h1>
            <EtapaBadge pedido={pedido} />
          </div>
          <p className="text-sm text-muted-foreground">
            {pedido.nomeCliente} · {formatDateTime(pedido.dataPedido)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {devolucaoPendente && (
            <>
              <Button variant="outline" onClick={() => responderDevolucao(pedido, devolucaoPendente, false)}>
                <XIcon /> Recusar devolução
              </Button>
              <Button onClick={() => responderDevolucao(pedido, devolucaoPendente, true)}>
                <CheckIcon /> Aprovar devolução
              </Button>
            </>
          )}
          {podeAvancar && pedido.proximaEtapa && (
            <Button onClick={() => setAvancando(pedido)}>
              {ACAO_DA_ETAPA[pedido.proximaEtapa]} <ArrowRightIcon />
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
              {devolucao && etapa !== "CANCELADO" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Solicitada em {formatDateTime(devolucao.dataDevolucao)} · Motivo: {devolucao.motivo}
                </p>
              )}
            </div>
          )}
          {!foraDoFluxo && <ProgressoEntrega alcancadas={alcancadas} />}

          {(pedido.transportadora || pedido.codigoRastreamento || pedido.dataEntregaPrevista) && (
            <div className="flex flex-wrap items-start gap-x-6 gap-y-2 rounded-md border p-3 text-sm">
              <TruckIcon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              {(pedido.transportadora || pedido.codigoRastreamento) && (
                <div>
                  <p className="text-xs text-muted-foreground">Rastreio</p>
                  <p className="font-medium">
                    {pedido.transportadora ?? "—"}
                    {pedido.codigoRastreamento && (
                      <>
                        {" · "}
                        <span className="font-mono">{pedido.codigoRastreamento}</span>
                      </>
                    )}
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
                {pedido.itens.map((item) => (
                  <li key={item.idProduto} className="flex items-center gap-3 p-3 text-sm">
                    <MiniaturaProduto src={item.imagemUrl} className="size-12" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/produtos/${item.idProduto}`} className="block truncate font-medium hover:underline">
                        {item.nomeProduto}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {item.quantidade} × {formatBRL(item.precoUnitario)}
                      </span>
                    </div>
                    <span className="shrink-0 font-medium">{formatBRL(item.subtotal)}</span>
                  </li>
                ))}
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
              <CardTitle>Entregar para</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{pedido.nomeCliente}</p>
              {endereco ? (
                <p className="text-muted-foreground">
                  {endereco.rua}, {endereco.numero}
                  {endereco.complemento && ` - ${endereco.complemento}`}
                  <br />
                  {endereco.cidade}/{endereco.estado} · CEP {endereco.cep}
                </p>
              ) : (
                <p className="text-muted-foreground">Sem endereço informado.</p>
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

      <AvancarPedidoDialog pedido={avancando} onFechar={() => setAvancando(null)} onAvancado={recarregar} />
      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </>
  );
}
