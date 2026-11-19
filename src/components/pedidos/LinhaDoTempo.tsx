import { ETAPA_PEDIDO_LABEL, rotulo } from "@/lib/admin-labels";
import { formatDateTime } from "@/lib/format";
import type { PedidoHistorico } from "@/types";

/** Histórico de status de um pedido, do mais antigo ao mais recente. */
export function LinhaDoTempo({ itens }: { itens: PedidoHistorico[] }) {
  if (itens.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma mudança de status registrada.</p>;
  }
  return (
    <ol className="space-y-3 border-l pl-4">
      {itens.map((h, i) => (
        <li key={h.id} className="relative text-sm">
          <span
            className={
              i === itens.length - 1
                ? "absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-primary/20"
                : "absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-primary/60"
            }
          />
          <span className="font-medium">{rotulo(ETAPA_PEDIDO_LABEL, h.etapa)}</span>
          <span className="block text-xs text-muted-foreground">
            {formatDateTime(h.data)}
            {h.nomeAutor && ` · ${h.nomeAutor}`}
            {h.descricao && ` · ${h.descricao}`}
          </span>
        </li>
      ))}
    </ol>
  );
}
