import { api, normalizePage } from "@/services/api";
import type {
  Page,
  Produto,
  ProdutoFiltros,
  ProdutoRequest,
  RawPage,
} from "@/types";

const BASE = "/produtos";

/** Maior página aceita pelo back-end (`PAGE_SIZE_MAXIMO`). */
const TAMANHO_PAGINA_EXPORTACAO = 50;

function temFiltro(f: ProdutoFiltros): boolean {
  return (
    !!f.nome?.trim() ||
    f.idCategoria !== undefined ||
    f.precoMin !== undefined ||
    f.precoMax !== undefined
  );
}

export const produtoService = {
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
        page,
        size: filtros.size,
      },
    });
    return normalizePage(raw);
  },

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
