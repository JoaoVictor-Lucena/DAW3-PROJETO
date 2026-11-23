import { api, normalizePage } from "@/services/api";
import type {
  Avaliacao,
  AvaliacaoRequest,
  AvaliacaoResumo,
  Page,
  PodeAvaliar,
  RawPage,
} from "@/types";

const BASE = "/avaliacoes";

export const avaliacaoService = {
  async listar(page = 0): Promise<Page<Avaliacao>> {
    return normalizePage(await api.get<RawPage<Avaliacao>>(BASE, { query: { page } }));
  },

  /** Usa o filtro `?idProduto=`, que é público (o visitante vê as avaliações sem logar). */
  async listarPorProduto(idProduto: number): Promise<Avaliacao[]> {
    const todas: Avaliacao[] = [];
    let page = 0;
    let atual: Page<Avaliacao>;
    do {
      atual = normalizePage(
        await api.get<RawPage<Avaliacao>>(BASE, { query: { idProduto, page } }),
      );
      todas.push(...atual.content);
      page += 1;
    } while (!atual.last && page < atual.totalPages);
    return todas;
  },

  async listarPorProdutoPaginado(idProduto: number, page = 0): Promise<Page<Avaliacao>> {
    return normalizePage(
      await api.get<RawPage<Avaliacao>>(BASE, { query: { idProduto, page } }),
    );
  },

  resumo: (idProduto: number) =>
    api.get<AvaliacaoResumo>(`${BASE}/resumo`, { query: { idProduto } }),

  /** CLIENTE: só quem recebeu o produto (pedido entregue) e ainda não o avaliou. */
  podeAvaliar: (idProduto: number) =>
    api.get<PodeAvaliar>(`${BASE}/pode-avaliar`, { query: { idProduto } }),

  /** CLIENTE: lista as avaliações feitas pelo cliente logado. */
  async minhas(page = 0): Promise<Page<Avaliacao>> {
    return normalizePage(
      await api.get<RawPage<Avaliacao>>(`${BASE}/minhas`, { query: { page } }),
    );
  },

  criar: (dto: AvaliacaoRequest) => api.post<Avaliacao>(BASE, dto),

  remover: (id: number) => api.delete<void>(`${BASE}/${id}`),
};
