import { api, normalizePage } from "@/services/api";
import type { Devolucao, Page, Pedido, PedidoHistorico, RawPage, StatusPedido } from "@/types";

/** Pedidos do usuário logado: o back-end devolve só os do cliente (mais recentes primeiro). */
export const pedidoService = {
  async meus(filtros: { status?: StatusPedido; page: number }): Promise<Page<Pedido>> {
    return normalizePage(await api.get<RawPage<Pedido>>("/pedidos", { query: filtros }));
  },

  buscar: (id: number) => api.get<Pedido>(`/pedidos/${id}`),

  historico: (id: number) => api.get<PedidoHistorico[]>(`/pedidos/${id}/historico`),

  /** Só para pedidos CRIADOS ou CONFIRMADOS que ainda não foram enviados. */
  cancelar: (id: number) => api.patch<Pedido>(`/pedidos/${id}/cancelar`),

  /** Só para pedidos já entregues e sem outra devolução pendente ou aprovada. */
  solicitarDevolucao: (idPedido: number, motivo: string) =>
    api.post<Devolucao>("/devolucoes", { idPedido, motivo }),
};
