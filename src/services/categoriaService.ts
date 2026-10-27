import { api, normalizePage } from "@/services/api";
import type { Categoria, CategoriaRequest, Page, RawPage } from "@/types";

const BASE = "/categorias";

export const categoriaService = {
  async listar(page = 0): Promise<Page<Categoria>> {
    return normalizePage(await api.get<RawPage<Categoria>>(BASE, { query: { page } }));
  },

  async listarTodas(): Promise<Categoria[]> {
    const todas: Categoria[] = [];
    let page = 0;
    let atual: Page<Categoria>;
    do {
      atual = await this.listar(page);
      todas.push(...atual.content);
      page += 1;
    } while (!atual.last && page < atual.totalPages);
    return todas;
  },

  buscarPorId: (id: number) => api.get<Categoria>(`${BASE}/${id}`),

  criar: (dto: CategoriaRequest) => api.post<Categoria>(BASE, dto),

  atualizar: (id: number, dto: CategoriaRequest) =>
    api.patch<Categoria>(`${BASE}/${id}`, dto),

  remover: (id: number) => api.delete<void>(`${BASE}/${id}`),
};
