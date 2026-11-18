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

  /**
   * Devoluções do cliente, a mais recente de cada pedido. O `etapaAtual` do pedido não muda
   * quando o cliente pede devolução, então as telas usam este mapa para mostrar o andamento.
   */
  async devolucoesPorPedido(): Promise<Record<number, Devolucao>> {
    const porPedido: Record<number, Devolucao> = {};
    let page = 0;
    let atual: Page<Devolucao>;
    do {
      atual = normalizePage(
        await api.get<RawPage<Devolucao>>("/devolucoes/minhas", { query: { page } }),
      );
      for (const d of atual.content) {
        const anterior = porPedido[d.idPedido];
        if (!anterior || d.dataDevolucao > anterior.dataDevolucao) porPedido[d.idPedido] = d;
      }
      page += 1;
    } while (!atual.last && page < Math.min(atual.totalPages, 10));
    return porPedido;
  },

  /** Só para pedidos já entregues e sem outra devolução pendente ou aprovada. */
  solicitarDevolucao: (idPedido: number, motivo: string) =>
    api.post<Devolucao>("/devolucoes", { idPedido, motivo }),
};
