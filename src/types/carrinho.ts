export interface ItemCarrinho {
  idProduto: number;
  nomeProduto?: string;
  quantidade: number;
  precoUnitario?: number;
  subtotal?: number;
}

export interface Carrinho {
  itens: ItemCarrinho[];
  total?: number;
}

export interface ItemCarrinhoRequest {
  idProduto: number;
  quantidade: number;
}

export interface CheckoutRequest {
  idEndereco: number;
  metodoPagamento: string;
  codigoCupom?: string;
}
