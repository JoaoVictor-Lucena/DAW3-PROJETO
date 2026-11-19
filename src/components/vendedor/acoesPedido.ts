import type { EtapaPedido, Pedido } from "@/types";

/** Texto do botão que leva o pedido à próxima etapa, do ponto de vista do vendedor. */
export const ACAO_DA_ETAPA: Partial<Record<EtapaPedido, string>> = {
  PAGAMENTO_APROVADO: "Confirmar pagamento",
  EMBALADO: "Marcar como embalado",
  EM_TRANSITO: "Despachar",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Confirmar entrega",
};

/** Etapas em que o vendedor pode informar transportadora e código de rastreio. */
export const ETAPAS_COM_RASTREIO: readonly EtapaPedido[] = ["EMBALADO", "EM_TRANSITO"];

/** O pedido espera uma ação do vendedor (o back-end informa a próxima etapa permitida). */
export function aguardaVendedor(p: Pick<Pedido, "proximaEtapa">) {
  return !!p.proximaEtapa && p.proximaEtapa in ACAO_DA_ETAPA;
}
