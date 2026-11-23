import { api, normalizePage } from "@/services/api";
import type { Devolucao, Page, Pedido, RawPage } from "@/types";

const BASE = "/devolucoes";

export interface DevolucaoRequest {
  idPedido: number;
  motivo: string;
}

/**
 * Serviços de devolução para o cliente logado.
 */
export const devolucaoService = {
  /** Lista uma página das devoluções solicitadas pelo cliente logado (GET /devolucoes/minhas). */
  async minhas(page = 0): Promise<Page<Devolucao>> {
    return normalizePage(
      await api.get<RawPage<Devolucao>>(`${BASE}/minhas`, { query: { page } }),
    );
  },

  /** Busca todas as páginas de devoluções do cliente logado para cruzamento e listagem completa. */
  async listarTodasMinhas(): Promise<Devolucao[]> {
    const todas: Devolucao[] = [];
    let page = 0;
    let atual: Page<Devolucao>;
    do {
      atual = await this.minhas(page);
      todas.push(...atual.content);
      page += 1;
    } while (!atual.last && page < atual.totalPages);
    return todas;
  },

  /** Busca todos os pedidos do cliente logado (GET /pedidos) percorrendo as páginas. */
  async listarTodosPedidosCliente(): Promise<Pedido[]> {
    const todos: Pedido[] = [];
    let page = 0;
    let atual: Page<Pedido>;
    do {
      atual = normalizePage(
        await api.get<RawPage<Pedido>>("/pedidos", { query: { page } }),
      );
      todos.push(...atual.content);
      page += 1;
    } while (!atual.last && page < atual.totalPages);
    return todos;
  },

  /** Registra uma nova solicitação de devolução (POST /devolucoes). */
  async solicitar(dto: DevolucaoRequest): Promise<Devolucao> {
    return api.post<Devolucao>(BASE, dto);
  },
};
