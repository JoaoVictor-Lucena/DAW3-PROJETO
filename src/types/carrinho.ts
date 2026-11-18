export interface ItemCarrinho {
  idProduto: number;
  nomeProduto: string;
  imagemUrl: string | null;
  idVendedor: number;
  nomeVendedor: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  estoqueDisponivel: number;
  /** false quando o anúncio foi pausado ou o vendedor bloqueado. */
  disponivel: boolean;
}

export interface Carrinho {
  id: number;
  valorTotal: number;
  quantidadeItens: number;
  itens: ItemCarrinho[];
}

export interface ItemCarrinhoRequest {
  idProduto: number;
  quantidade: number;
}
