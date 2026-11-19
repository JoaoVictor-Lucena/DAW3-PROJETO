export type StatusPedido = "CRIADO" | "CONFIRMADO" | "CANCELADO" | "DEVOLVIDO";

export type StatusEntrega = "EMBALADO" | "EM_TRANSITO" | "SAIU_PARA_ENTREGA" | "ENTREGUE";

export type StatusDevolucao = "PENDENTE" | "APROVADA" | "RECUSADA";

export interface Devolucao {
  id: number;
  dataDevolucao: string;
  motivo: string;
  status: StatusDevolucao;
  idPedido: number;
  idCliente: number;
  nomeCliente: string;
  valorPedido: number;
}

export type EtapaPedido =
  | "PEDIDO_CRIADO"
  | "PEDIDO_CONFIRMADO"
  | "PAGAMENTO_APROVADO"
  | "PAGAMENTO_RECUSADO"
  | "EMBALADO"
  | "EM_TRANSITO"
  | "SAIU_PARA_ENTREGA"
  | "ENTREGUE"
  | "CANCELADO"
  | "DEVOLUCAO_SOLICITADA"
  | "DEVOLUCAO_RECUSADA"
  | "DEVOLVIDO";

export interface ItemPedido {
  idPedido: number;
  idProduto: number;
  nomeProduto: string;
  imagemUrl: string | null;
  idVendedor: number;
  nomeVendedor: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface EnderecoEntrega {
  rua: string;
  numero: string;
  complemento: string | null;
  cep: string;
  cidade: string;
  estado: string;
}

export interface Pedido {
  id: number;
  dataPedido: string;
  subtotal: number;
  valorDesconto: number | null;
  valorTotal: number;
  status: StatusPedido;
  etapaAtual: EtapaPedido | null;
  proximaEtapa: EtapaPedido | null;
  idCliente: number;
  nomeCliente: string;
  codigoCompra: string | null;
  codigoCupom: string | null;
  enderecoEntrega: EnderecoEntrega | null;
  metodoPagamento: string | null;
  statusPagamento: string | null;
  idEntrega?: number | null;
  statusEntrega?: StatusEntrega | null;
  transportadora: string | null;
  codigoRastreamento: string | null;
  dataEnvio?: string | null;
  dataEntregaPrevista?: string | null;
  dataEntrega?: string | null;
  /** Devolução mais recente do pedido (ausente se o cliente nunca pediu). */
  idDevolucao?: number | null;
  statusDevolucao?: StatusDevolucao | null;
  dataDevolucao?: string | null;
  motivoDevolucao?: string | null;
  itens: ItemPedido[];
}

/** A devolução mais recente de um pedido, montada a partir dos campos do próprio pedido. */
export interface DevolucaoDoPedido {
  id: number;
  status: StatusDevolucao;
  dataDevolucao: string;
  motivo: string;
}

export function devolucaoDoPedido(p: Pedido): DevolucaoDoPedido | null {
  if (!p.idDevolucao || !p.statusDevolucao) return null;
  return {
    id: p.idDevolucao,
    status: p.statusDevolucao,
    dataDevolucao: p.dataDevolucao ?? "",
    motivo: p.motivoDevolucao ?? "",
  };
}

export interface PedidoHistorico {
  id: number;
  idPedido: number;
  etapa: EtapaPedido;
  data: string;
  descricao: string | null;
  nomeAutor: string | null;
  papelAutor: string | null;
}
