import { api, normalizePage } from "@/services/api";
import type { Avaliacao, AvaliacaoRequest, Page, RawPage } from "@/types";

const BASE = "/avaliacoes";

export const avaliacaoService = {
  async listar(page = 0): Promise<Page<Avaliacao>> {
    return normalizePage(await api.get<RawPage<Avaliacao>>(BASE, { query: { page } }));
  },

  /** Percorre as páginas e filtra as avaliações vinculadas a `idProduto`. */
  async listarPorProduto(idProduto: number): Promise<Avaliacao[]> {
    const todas: Avaliacao[] = [];
    let page = 0;
    let atual: Page<Avaliacao>;
    do {
      atual = await this.listar(page);
      todas.push(...atual.content.filter((a) => a.idProduto === idProduto));
      page += 1;
    } while (!atual.last && page < atual.totalPages);
    return todas;
  },

  criar: (dto: AvaliacaoRequest) => api.post<Avaliacao>(BASE, dto),

  remover: (id: number) => api.delete<void>(`${BASE}/${id}`),
};
