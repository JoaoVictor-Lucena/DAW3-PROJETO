export interface Avaliacao {
  id: number;
  nota: number;
  comentario: string | null;
  dataAvaliacao: string;
  idCliente: number;
  nomeCliente: string;
  idProduto: number;
  nomeProduto: string;
}

export interface AvaliacaoRequest {
  nota: number;
  comentario?: string;
  idProduto: number;
  idCliente?: number;
}

/** Se o cliente logado pode avaliar o produto; quando não pode, `motivo` explica por quê. */
export interface PodeAvaliar {
  podeAvaliar: boolean;
  motivo: string | null;
}
