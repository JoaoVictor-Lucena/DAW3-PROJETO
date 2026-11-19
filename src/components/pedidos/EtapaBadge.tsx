import { Badge } from "@/components/ui/badge";
import { ETAPA_PEDIDO_LABEL, STATUS_PEDIDO_LABEL, rotulo } from "@/lib/admin-labels";
import { cn } from "@/lib/utils";
import type { Devolucao, EtapaPedido, Pedido, StatusDevolucao } from "@/types";

const AZUL = "bg-sky-500/15 text-sky-700 dark:text-sky-300";
const INDIGO = "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300";
const AMBAR = "bg-amber-500/15 text-amber-800 dark:text-amber-300";
const VERDE = "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
const VERMELHO = "bg-destructive/10 text-destructive dark:bg-destructive/20";
const LARANJA = "bg-orange-500/15 text-orange-700 dark:text-orange-300";
const VIOLETA = "bg-violet-500/15 text-violet-700 dark:text-violet-300";
const NEUTRO = "bg-muted text-muted-foreground";

const COR_ETAPA: Record<EtapaPedido, string> = {
  PEDIDO_CRIADO: AZUL,
  PEDIDO_CONFIRMADO: AZUL,
  PAGAMENTO_APROVADO: INDIGO,
  PAGAMENTO_RECUSADO: VERMELHO,
  EMBALADO: AMBAR,
  EM_TRANSITO: AMBAR,
  SAIU_PARA_ENTREGA: AMBAR,
  ENTREGUE: VERDE,
  CANCELADO: VERMELHO,
  DEVOLUCAO_SOLICITADA: LARANJA,
  DEVOLUCAO_RECUSADA: NEUTRO,
  DEVOLVIDO: VIOLETA,
};

/** Etapa equivalente quando o back-end não informa `etapaAtual`. */
const ETAPA_DO_STATUS: Record<Pedido["status"], EtapaPedido> = {
  CRIADO: "PEDIDO_CRIADO",
  CONFIRMADO: "PEDIDO_CONFIRMADO",
  CANCELADO: "CANCELADO",
  DEVOLVIDO: "DEVOLVIDO",
};

const ETAPA_DA_DEVOLUCAO: Record<StatusDevolucao, EtapaPedido> = {
  PENDENTE: "DEVOLUCAO_SOLICITADA",
  RECUSADA: "DEVOLUCAO_RECUSADA",
  APROVADA: "DEVOLVIDO",
};

/**
 * Etapa a mostrar para o cliente. Uma devolução em andamento tem prioridade, porque o
 * `etapaAtual` do back-end continua "ENTREGUE" depois que a devolução é solicitada.
 */
export function etapaDoPedido(
  pedido: Pick<Pedido, "status" | "etapaAtual">,
  devolucao?: Pick<Devolucao, "status"> | null,
): EtapaPedido {
  if (devolucao && pedido.status !== "CANCELADO") return ETAPA_DA_DEVOLUCAO[devolucao.status];
  return pedido.etapaAtual ?? ETAPA_DO_STATUS[pedido.status];
}

/** Badge colorido com a etapa atual do pedido (ex.: "Em trânsito", "Entregue"). */
export function EtapaBadge({
  pedido,
  devolucao,
  className,
}: {
  pedido: Pick<Pedido, "status" | "etapaAtual">;
  devolucao?: Pick<Devolucao, "status"> | null;
  className?: string;
}) {
  const etapa = etapaDoPedido(pedido, devolucao);
  return (
    <Badge
      variant="secondary"
      className={cn(COR_ETAPA[etapa] ?? NEUTRO, className)}
      title={`Status do pedido: ${rotulo(STATUS_PEDIDO_LABEL, pedido.status)}`}
    >
      {rotulo(ETAPA_PEDIDO_LABEL, etapa)}
    </Badge>
  );
}
