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
