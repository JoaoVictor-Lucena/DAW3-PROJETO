"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LinhaDoTempo } from "@/components/pedidos/LinhaDoTempo";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatDateTime } from "@/lib/format";
import { adminService } from "@/services/adminService";
import { getErrorMessage } from "@/services/api";
import type { Pedido, PedidoHistorico } from "@/types";

type Historico = { id: number; itens?: PedidoHistorico[]; erro?: string };

/** Detalhe de um pedido: itens, valores, entrega e a linha do tempo de status. */
export function PedidoDetalheDialog({
  pedido,
  onFechar,
}: {
  pedido: Pedido | null;
  onFechar: () => void;
}) {
  const [historico, setHistorico] = React.useState<Historico | null>(null);

  React.useEffect(() => {
    if (!pedido) return;
    let cancelado = false;
    adminService
      .historicoPedido(pedido.id)
      .then((itens) => !cancelado && setHistorico({ id: pedido.id, itens }))
      .catch((e) => !cancelado && setHistorico({ id: pedido.id, erro: getErrorMessage(e) }));
    return () => {
      cancelado = true;
    };
  }, [pedido]);

  const historicoAtual = historico?.id === pedido?.id ? historico : null;
  const endereco = pedido?.enderecoEntrega;

  return (
    <Dialog open={pedido !== null} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {pedido && (
          <>
            <DialogHeader>
              <DialogTitle>Pedido #{pedido.id}</DialogTitle>
              <DialogDescription>
                {pedido.nomeCliente} · {formatDateTime(pedido.dataPedido)}
                {pedido.codigoCompra && ` · compra ${pedido.codigoCompra}`}
              </DialogDescription>
            </DialogHeader>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Itens</h3>
              <ul className="divide-y rounded-lg border">
                {pedido.itens.map((item) => (
                  <li key={item.idProduto} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{item.nomeProduto}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.nomeVendedor} · {item.quantidade} × {formatBRL(item.precoUnitario)}
                      </span>
                    </span>
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
                    <dd className="text-right">− {formatBRL(pedido.valorDesconto)}</dd>
                  </>
                )}
                <dt className="font-semibold">Total</dt>
                <dd className="text-right font-semibold">{formatBRL(pedido.valorTotal)}</dd>
              </dl>
            </section>

            <section className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <h3 className="font-semibold">Entrega</h3>
                {endereco ? (
                  <p className="text-muted-foreground">
                    {endereco.rua}, {endereco.numero}
                    {endereco.complemento && ` - ${endereco.complemento}`}
                    <br />
                    {endereco.cidade}/{endereco.estado} · CEP {endereco.cep}
                  </p>
                ) : (
                  <p className="text-muted-foreground">Sem endereço.</p>
                )}
                {pedido.codigoRastreamento && (
                  <p className="text-muted-foreground">
                    {pedido.transportadora} · {pedido.codigoRastreamento}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">Pagamento</h3>
                <p className="text-muted-foreground">
                  {pedido.metodoPagamento ?? "—"} · {pedido.statusPagamento ?? "—"}
                </p>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Linha do tempo</h3>
              {!historicoAtual ? (
                <Skeleton className="h-20 w-full" />
              ) : historicoAtual.erro ? (
                <p className="text-sm text-destructive">{historicoAtual.erro}</p>
              ) : (
                <LinhaDoTempo itens={historicoAtual.itens ?? []} />
              )}
            </section>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
