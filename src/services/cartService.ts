import { api } from "@/services/api";
import type { Carrinho, ItemCarrinhoRequest } from "@/types";

const BASE = "/carrinhos/meu";

export const cartService = {
  getCart: () => api.get<Carrinho>(BASE),

  addItem: (idProduto: number, quantidade: number) =>
    api.post<Carrinho>(`${BASE}/itens`, { idProduto, quantidade }),

  removeItem: (idProduto: number) => api.delete<void>(`${BASE}/itens/${idProduto}`),

  mergeLocalCart: (itens: ItemCarrinhoRequest[]) =>
    api.post<Carrinho>(`${BASE}/mesclar`, { itens }),
};
