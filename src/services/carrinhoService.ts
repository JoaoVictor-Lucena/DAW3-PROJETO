import { api } from "@/services/api";
import type { Carrinho } from "@/types";

/** Carrinho do cliente logado (perfil CLIENTE). */
export const carrinhoService = {
  meu: () => api.get<Carrinho>("/carrinhos/meu"),
  esvaziar: () => api.delete<Carrinho>("/carrinhos/meu"),
};
