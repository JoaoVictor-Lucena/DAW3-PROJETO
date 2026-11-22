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
  imagemUrl?: string;
}

export interface ProdutoFiltros {
  nome?: string;
  idCategoria?: number;
  precoMin?: number;
  precoMax?: number;
  page?: number;
  size?: number;
}

export interface ProdutoBuscaVitrine {
  nome?: string;
  idCategoria?: number;
  precoMin?: number;
  precoMax?: number;
  avaliacaoMin?: number;
  somenteComEstoque?: boolean;
  idVendedor?: number;
  sort?: string;
  page?: number;
  size?: number;
}
