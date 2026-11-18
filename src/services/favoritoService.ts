import { api, normalizePage } from "@/services/api";
import type { Page, Produto, RawPage } from "@/types";

const BASE = "/favoritos";

/** Lista de desejos do cliente logado (todas as rotas exigem perfil CLIENTE). */
export const favoritoService = {
  async listar(page = 0): Promise<Page<Produto>> {
    return normalizePage(await api.get<RawPage<Produto>>(BASE, { query: { page } }));
  },

  ids: () => api.get<number[]>(`${BASE}/ids`),

  adicionar: (idProduto: number) => api.put<void>(`${BASE}/${idProduto}`),

  remover: (idProduto: number) => api.delete<void>(`${BASE}/${idProduto}`),
};
