import { api } from "@/services/api";
import type { CheckoutRequest, Pedido } from "@/types";

export const checkoutService = {
  checkout: (dados: CheckoutRequest) => api.post<Pedido>("/checkout", dados),
};

export const checkout = checkoutService.checkout;
