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
  imagemUrl?: string | null;
  ativo?: boolean;
  mediaAvaliacoes?: number | null;
  totalAvaliacoes?: number;
  dataCadastro?: string;
}

export interface ProdutoRequest {
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  idCategoria: number;
  idVendedor?: number;
  /** Obrigatória no back-end ao criar um produto (URL http/https). */
  imagemUrl?: string;
}

export interface ProdutoFiltros {
  nome?: string;
  idCategoria?: number;
  precoMin?: number;
  precoMax?: number;
  sort?: string;
  somenteComEstoque?: boolean;
  page?: number;
  size?: number;
}
