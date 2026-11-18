import { api } from "@/services/api";
import type { CheckoutPayload, Pedido } from "@/types";

export interface CompraResponse {
  id: number;
  codigo: string;
  dataCompra: string;
  idCliente: number;
  nomeCliente: string;
  codigoCupom?: string | null;
  metodoPagamento: string;
  statusPagamento: string;
  valorSubtotal: number;
  valorDesconto: number;
  valorTotal: number;
  quantidadePedidos: number;
  pedidos?: Pedido[];
}

export const checkoutService = {
  /**
   * Finaliza a compra transformando os itens do carrinho em pedidos.
   * Realiza POST /checkout com o CheckoutPayload.
   */
  checkout: (payload: CheckoutPayload) =>
    api.post<CompraResponse>("/checkout", payload),

  finalizar: (payload: CheckoutPayload) =>
    api.post<CompraResponse>("/checkout", payload),
};

export const finalizarCheckout = (payload: CheckoutPayload) =>
  checkoutService.checkout(payload);
