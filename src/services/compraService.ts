import { api } from "@/services/api";
import type { CompraResponse } from "@/services/checkoutService";

/** Compras do cliente logado (e consulta por ADMIN). */
export const compraService = {
  buscarPorCodigo: (codigo: string) =>
    api.get<CompraResponse>(`/compras/${encodeURIComponent(codigo)}`),
};
