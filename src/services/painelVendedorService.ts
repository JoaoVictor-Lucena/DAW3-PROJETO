import { api, normalizePage } from "@/services/api";
import type {
  Avaliacao,
  DashboardVendedor,
  Devolucao,
  EtapaPedido,
  Page,
  Pedido,
  PedidoHistorico,
  PerfilLojaRequest,
  Periodo,
  Produto,
  RawPage,
  StatusDevolucao,
  StatusPedido,
  Vendedor,
} from "@/types";

async function pagina<T>(path: string, query: Record<string, string | number | boolean | undefined>) {
  return normalizePage(await api.get<RawPage<T>>(path, { query }));
}

/** Alterações rápidas de um produto (o PATCH aceita qualquer subconjunto dos campos). */
export interface ProdutoRapido {
  preco?: number;
  estoque?: number;
  imagemUrl?: string;
  ativo?: boolean;
}

/**
 * Chamadas do painel do vendedor. O back-end filtra tudo pelo vendedor do token: produtos,
 * pedidos, devoluções e avaliações de outras lojas nunca chegam aqui.
 */
export const painelVendedorService = {
  dashboard: (periodo: Periodo) =>
    api.get<DashboardVendedor>("/dashboard/vendedor", { query: { periodo } }),

  produtos: (filtros: { nome?: string; ativo?: boolean; page: number }): Promise<Page<Produto>> =>
    pagina<Produto>("/produtos/meus", { ...filtros, nome: filtros.nome?.trim() || undefined }),

  atualizarProduto: (id: number, dto: ProdutoRapido) => api.patch<Produto>(`/produtos/${id}`, dto),

  pedidos: (filtros: { status?: StatusPedido; page: number }): Promise<Page<Pedido>> =>
    pagina<Pedido>("/pedidos", filtros),

  pedido: (id: number) => api.get<Pedido>(`/pedidos/${id}`),

  historico: (id: number) => api.get<PedidoHistorico[]>(`/pedidos/${id}/historico`),

  /** Avança o pedido para a próxima etapa (o back-end recusa saltos com 422). */
  avancar: (
    id: number,
    status: EtapaPedido,
    rastreio?: { transportadora?: string; codigoRastreamento?: string },
  ) => api.patch<Pedido>(`/pedidos/${id}/status`, { status, ...rastreio }),

  devolucoes: (filtros: { status?: StatusDevolucao; page: number }): Promise<Page<Devolucao>> =>
    pagina<Devolucao>("/devolucoes/recebidas", filtros),

  /**
   * Devoluções recebidas, a mais recente de cada pedido. O `etapaAtual` do pedido continua
   * "ENTREGUE" quando o cliente pede devolução, então as telas usam este mapa para o badge.
   */
  async devolucoesPorPedido(): Promise<Record<number, Devolucao>> {
    const porPedido: Record<number, Devolucao> = {};
    let page = 0;
    let atual: Page<Devolucao>;
    do {
      atual = await this.devolucoes({ page });
      for (const d of atual.content) {
        const anterior = porPedido[d.idPedido];
        if (!anterior || d.dataDevolucao > anterior.dataDevolucao) porPedido[d.idPedido] = d;
      }
      page += 1;
    } while (!atual.last && page < Math.min(atual.totalPages, 10));
    return porPedido;
  },

  aprovarDevolucao: (id: number) => api.patch<Devolucao>(`/devolucoes/${id}/aprovar`),

  rejeitarDevolucao: (id: number) => api.patch<Devolucao>(`/devolucoes/${id}/rejeitar`),

  avaliacoes: (page: number): Promise<Page<Avaliacao>> =>
    pagina<Avaliacao>("/avaliacoes/recebidas", { page }),

  perfil: () => api.get<Vendedor>("/vendedores/me"),

  atualizarPerfil: (id: number, dto: PerfilLojaRequest) => api.patch<Vendedor>(`/vendedores/${id}`, dto),

  /** Fecha (false) ou reabre (true) a loja; fechada, os produtos saem da vitrine. */
  alterarLoja: (aberta: boolean) => api.patch<Vendedor>("/vendedores/me/loja", { aberta }),
};
