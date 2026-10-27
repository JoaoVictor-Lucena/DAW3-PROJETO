import { api, normalizePage } from "@/services/api";
import type {
  Page,
  Produto,
  ProdutoFiltros,
  ProdutoRequest,
  RawPage,
} from "@/types";

const BASE = "/produtos";

function temFiltro(f: ProdutoFiltros): boolean {
  return (
    !!f.nome?.trim() ||
    f.idCategoria !== undefined ||
    f.precoMin !== undefined ||
    f.precoMax !== undefined
  );
}

export const produtoService = {
  async listar(page = 0): Promise<Page<Produto>> {
    return normalizePage(await api.get<RawPage<Produto>>(BASE, { query: { page } }));
  },

  /** Usa GET /produtos/buscar quando há algum filtro; senão GET /produtos. */
  async buscar(filtros: ProdutoFiltros = {}): Promise<Page<Produto>> {
    const page = filtros.page ?? 0;
    if (!temFiltro(filtros)) return this.listar(page);

    const raw = await api.get<RawPage<Produto>>(`${BASE}/buscar`, {
      query: {
        nome: filtros.nome?.trim(),
        idCategoria: filtros.idCategoria,
        precoMin: filtros.precoMin,
        precoMax: filtros.precoMax,
        page,
      },
    });
    return normalizePage(raw);
  },

  buscarPorId: (id: number) => api.get<Produto>(`${BASE}/${id}`),

  criar: (dto: ProdutoRequest) => api.post<Produto>(BASE, dto),

  atualizar: (id: number, dto: ProdutoRequest) =>
    api.patch<Produto>(`${BASE}/${id}`, dto),

  remover: (id: number) => api.delete<void>(`${BASE}/${id}`),
};
