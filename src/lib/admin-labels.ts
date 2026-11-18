import type { EtapaPedido, Role, StatusPedido } from "@/types";

export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  CRIADO: "Criado",
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
  DEVOLVIDO: "Devolvido",
};

export const ETAPA_PEDIDO_LABEL: Record<EtapaPedido, string> = {
  PEDIDO_CRIADO: "Pedido criado",
  PEDIDO_CONFIRMADO: "Pedido confirmado",
  PAGAMENTO_APROVADO: "Pagamento aprovado",
  PAGAMENTO_RECUSADO: "Pagamento recusado",
  EMBALADO: "Embalado",
  EM_TRANSITO: "Em trânsito",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
  DEVOLUCAO_SOLICITADA: "Devolução solicitada",
  DEVOLUCAO_RECUSADA: "Devolução recusada",
  DEVOLVIDO: "Devolvido",
};

export const ROLE_LABEL: Record<Role, string> = {
  CLIENTE: "Clientes",
  VENDEDOR: "Vendedores",
  ADMIN: "Admins",
};

export function rotulo<T extends string>(mapa: Record<T, string>, valor: string | null | undefined) {
  if (!valor) return "—";
  return mapa[valor as T] ?? valor;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}
