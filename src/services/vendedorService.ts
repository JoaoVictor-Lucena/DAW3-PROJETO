import { api, normalizePage } from "@/services/api";
import type { Page, RawPage, Vendedor } from "@/types";

const BASE = "/vendedores";

export const vendedorService = {
  async listar(page = 0): Promise<Page<Vendedor>> {
    return normalizePage(await api.get<RawPage<Vendedor>>(BASE, { query: { page } }));
  },

  async listarTodos(): Promise<Vendedor[]> {
    const todos: Vendedor[] = [];
    let page = 0;
    let atual: Page<Vendedor>;
    do {
      atual = await this.listar(page);
      todos.push(...atual.content);
      page += 1;
    } while (!atual.last && page < atual.totalPages);
    return todos;
  },

  buscarPorId: (id: number) => api.get<Vendedor>(`${BASE}/${id}`),
};
