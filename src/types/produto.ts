export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  idCategoria: number;
  nomeCategoria: string;
  idVendedor: number;
  nomeVendedor: string;
}

/** Body de POST/PATCH /produtos. `idVendedor` é obrigatório apenas para ADMIN. */
export interface ProdutoRequest {
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  idCategoria: number;
  idVendedor?: number;
}

export interface ProdutoFiltros {
  nome?: string;
  idCategoria?: number;
  precoMin?: number;
  precoMax?: number;
  page?: number;
}
