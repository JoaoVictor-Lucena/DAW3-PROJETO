"use client";

import * as React from "react";

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [carrinho, setCarrinho] = React.useState<Carrinho | null>(null);
  const [carregando, setCarregando] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [tentativa, setTentativa] = React.useState(0);

  React.useEffect(() => {
    let ativo = true;
    carrinhoService
      .meu()
      .then((c) => {
        if (!ativo) return;
        setCarrinho(c);
        setErro(null);
      })
      .catch((e) => ativo && setErro(getErrorMessage(e)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const recarregar = React.useCallback(() => {
    setCarregando(true);
    setTentativa((t) => t + 1);
  }, []);

  const clearCart = React.useCallback(() => setCarrinho(null), []);

  const value = React.useMemo(
    () => ({ carrinho, carregando, erro, recarregar, clearCart }),
    [carrinho, carregando, erro, recarregar, clearCart],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
