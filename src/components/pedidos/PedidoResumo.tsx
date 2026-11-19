import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { EtapaBadge } from "@/components/pedidos/EtapaBadge";
import { MiniaturaProduto } from "@/components/pedidos/MiniaturaProduto";
import { formatBRL, formatDateTime } from "@/lib/format";
import type { Pedido } from "@/types";

/**
 * Linha de um pedido nas listas: itens, total e etapa atual. O cliente vê a loja; o vendedor
 * (`mostrarCliente`) vê quem comprou e abre o pedido no próprio painel (`href`).
 */
export function PedidoResumo({
  pedido,
  href = `/conta/pedidos/${pedido.id}`,
  mostrarCliente = false,
  extra,
}: {
  pedido: Pedido;
  href?: string;
  mostrarCliente?: boolean;
  /** Conteúdo ao lado do badge da etapa (ex.: "Sua vez" no painel do vendedor). */
  extra?: React.ReactNode;
}) {
  const lojas = [...new Set(pedido.itens.map((i) => i.nomeVendedor))].join(", ");
  const quantidade = pedido.itens.reduce((acc, i) => acc + i.quantidade, 0);
  const primeiro = pedido.itens[0];
  const nomes = pedido.itens.map((i) => i.nomeProduto);
  const resumoItens =
    nomes.length > 2 ? `${nomes.slice(0, 2).join(", ")} e mais ${nomes.length - 2}` : nomes.join(", ");

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MiniaturaProduto src={primeiro?.imagemUrl ?? null} className="size-14" />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Pedido #{pedido.id}</span>
          <EtapaBadge pedido={pedido} />
          {extra}
        </div>
        <p className="truncate text-sm text-muted-foreground">{resumoItens}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDateTime(pedido.dataPedido)} · {mostrarCliente ? pedido.nomeCliente : lojas} · {quantidade} {quantidade === 1 ? "item" : "itens"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="font-semibold">{formatBRL(pedido.valorTotal)}</span>
        <ChevronRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
