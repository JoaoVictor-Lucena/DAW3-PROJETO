import { api, normalizePage } from "@/services/api";
import type {
  Page,
  Produto,
  ProdutoBuscaVitrine,
  ProdutoFiltros,
  ProdutoRequest,
  RawPage,
} from "@/types";

const BASE = "/produtos";

const TAMANHO_PAGINA_EXPORTACAO = 50;

function temFiltro(f: ProdutoFiltros): boolean {
  return (
    !!f.nome?.trim() ||
    f.idCategoria !== undefined ||
    f.precoMin !== undefined ||
    f.precoMax !== undefined ||
    !!f.sort ||
    f.somenteComEstoque !== undefined
  );
}

export interface BuscarProdutosPorVendedorParams {
  pagina?: number;
  tamanho?: number;
  ordenacao?: string;
  idCategoria?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export async function getProdutosPorVendedor(
  idVendedor: string | number,
  params?: BuscarProdutosPorVendedorParams,
): Promise<Page<Produto>> {
  const page = params?.pagina ?? params?.page ?? 0;
  const size = params?.tamanho ?? params?.size;
  const sort = params?.ordenacao ?? params?.sort;

  const raw = await api.get<RawPage<Produto>>(`${BASE}/buscar`, {
    query: {
      vendedor: idVendedor,
      idVendedor: idVendedor,
      idCategoria: params?.idCategoria,
      page,
      size,
      sort,
    },
  });
  return normalizePage(raw);
}

export const produtoService = {
  getProdutosPorVendedor,

  async listar(page = 0, size?: number): Promise<Page<Produto>> {
    return normalizePage(await api.get<RawPage<Produto>>(BASE, { query: { page, size } }));
  },

  async buscar(filtros: ProdutoFiltros = {}): Promise<Page<Produto>> {
    const page = filtros.page ?? 0;
    if (!temFiltro(filtros)) return this.listar(page, filtros.size);

    const raw = await api.get<RawPage<Produto>>(`${BASE}/buscar`, {
      query: {
        nome: filtros.nome?.trim(),
        idCategoria: filtros.idCategoria,
        precoMin: filtros.precoMin,
        precoMax: filtros.precoMax,
        sort: filtros.sort,
        somenteComEstoque: filtros.somenteComEstoque,
        page,
        size: filtros.size,
      },
    });
    return normalizePage(raw);
  },

  /**
   * Busca da vitrine pública: combina nome, categoria, faixa de preço, avaliação mínima,
   * estoque e loja, com ordenação feita no servidor (vale para todas as páginas).
   */
  async buscarVitrine(f: ProdutoBuscaVitrine = {}): Promise<Page<Produto>> {
    const raw = await api.get<RawPage<Produto>>(`${BASE}/buscar`, {
      query: {
        nome: f.nome?.trim(),
        idCategoria: f.idCategoria,
        precoMin: f.precoMin,
        precoMax: f.precoMax,
        avaliacaoMin: f.avaliacaoMin,
        somenteComEstoque: f.somenteComEstoque ? true : undefined,
        idVendedor: f.idVendedor,
        page: f.page ?? 0,
        size: f.size,
        sort: f.sort,
      },
    });
    return normalizePage(raw);
  },

  maisVendidos: (limite = 10) => api.get<Produto[]>(`${BASE}/mais-vendidos`, { query: { limite } }),

  /** Percorre todas as páginas da busca e devolve todos os produtos que atendem aos filtros. */
  async buscarTodos(filtros: Omit<ProdutoFiltros, "page" | "size"> = {}): Promise<Produto[]> {
    const todos: Produto[] = [];
    let page = 0;
    let atual: Page<Produto>;
    do {
      atual = await this.buscar({ ...filtros, page, size: TAMANHO_PAGINA_EXPORTACAO });
      todos.push(...atual.content);
      page += 1;
    } while (!atual.last && page < atual.totalPages);
    return todos;
  },

  buscarPorId: (id: number) => api.get<Produto>(`${BASE}/${id}`),

  criar: (dto: ProdutoRequest) => api.post<Produto>(BASE, dto),

  atualizar: (id: number, dto: ProdutoRequest) =>
    api.patch<Produto>(`${BASE}/${id}`, dto),

  remover: (id: number) => api.delete<void>(`${BASE}/${id}`),
};
