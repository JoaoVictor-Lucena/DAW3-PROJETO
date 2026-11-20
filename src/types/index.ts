export * from "./auth";
export * from "./avaliacao";
export * from "./categoria";
export * from "./cliente";
export * from "./page";
export * from "./problem-detail";
export * from "./produto";
export * from "./vendedor";
export * from "./admin";
export * from "./pedido";
export * from "./carrinho";
export * from "./notificacao";

export interface VendedorPublico {
  id: number | string;
  nome: string;
  nomeLoja?: string;
  razaoSocial?: string;
  imagemUrl?: string | null;
  bannerUrl?: string | null;
  banner?: string | null;
  descricao?: string | null;
  dataCadastro?: string;
  totalProdutos?: number;
  mediaAvaliacoes?: number | null;
  lojaAberta?: boolean;
  totalAvaliacoes?: number;
}

export interface Endereco {
  id?: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Cupom {
  codigo: string;
  desconto: number;
}

export type MetodoPagamento = "PIX" | "CARTAO" | "BOLETO";

export interface CheckoutPayload {
  idEndereco: number;
  metodoPagamento: MetodoPagamento;
  codigoCupom?: string;
}
