"use client";

import * as React from "react";

import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/services/api";
import { carrinhoService } from "@/services/carrinhoService";
import type { Carrinho } from "@/types";

interface CartContextValue {
  carrinho: Carrinho | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
  /** Zera o estado local (o back-end já esvazia o carrinho no checkout). */
  clearCart: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

/** Carrinho do cliente logado. Só busca no back-end para o perfil CLIENTE. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const chave = user?.role === "CLIENTE" ? (user.email ?? "cliente") : null;

  const [carrinho, setCarrinho] = React.useState<Carrinho | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  // Para qual usuário/tentativa o carrinho já foi carregado (evita setState síncrono no effect).
  const [carregadoPara, setCarregadoPara] = React.useState<string | null>(null);
  const [tentativa, setTentativa] = React.useState(0);
  const chaveAtual = chave === null ? null : `${chave}#${tentativa}`;

  React.useEffect(() => {
    if (chaveAtual === null) return;
    let ativo = true;
    carrinhoService
      .meu()
      .then((c) => {
        if (!ativo) return;
        setCarrinho(c);
        setErro(null);
      })
      .catch((e) => ativo && setErro(getErrorMessage(e)))
      .finally(() => ativo && setCarregadoPara(chaveAtual));
    return () => {
      ativo = false;
    };
  }, [chaveAtual]);

  const recarregar = React.useCallback(() => setTentativa((t) => t + 1), []);
  const clearCart = React.useCallback(() => setCarrinho(null), []);

  const value = React.useMemo<CartContextValue>(
    () => ({
      carrinho: chave === null ? null : carrinho,
      carregando: chaveAtual !== null && carregadoPara !== chaveAtual,
      erro: chave === null ? null : erro,
      recarregar,
      clearCart,
    }),
    [chave, chaveAtual, carrinho, carregadoPara, erro, recarregar, clearCart],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
