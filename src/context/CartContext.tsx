"use client";

import * as React from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { getErrorMessage, tokenStorage } from "@/services/api";
import { cartService } from "@/services/cartService";
import type { Carrinho } from "@/types";

export interface CartItem {
  produtoId: number;
  quantidade: number;
  nome?: string;
  preco?: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (produtoId: number, quantidade?: number, extra?: { nome?: string; preco?: number }) => Promise<void>;
  removeItem: (produtoId: number) => Promise<void>;
  clearCart: () => void;
}

const CART_KEY = "marketplace.cart";
const CartContext = React.createContext<CartContextValue | null>(null);

function load(): CartItem[] {
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  if (items.length) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  else window.localStorage.removeItem(CART_KEY);
}

/** Lê a sessão no momento da chamada: ações pendentes pós-login chegam com closures antigas. */
function sessionEmail(): string | null {
  if (!tokenStorage.get()) return null;
  try {
    return JSON.parse(window.localStorage.getItem("marketplace.user") ?? "null")?.email ?? null;
  } catch {
    return null;
  }
}

const fromApi = (c: Carrinho): CartItem[] =>
  c.itens.map((i) => ({
    produtoId: i.idProduto,
    quantidade: i.quantidade,
    nome: i.nomeProduto,
    preco: i.precoUnitario,
  }));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const email = user?.email ?? null;
  const [local, setLocal] = React.useState<CartItem[]>(load);
  const [remote, setRemote] = React.useState<{ email: string; items: CartItem[] } | null>(null);

  const mergedFor = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!email) {
      mergedFor.current = null;
      return;
    }
    if (mergedFor.current === email) return;
    mergedFor.current = email;

    (async () => {
      try {
        const pendentes = load();
        if (pendentes.length) {
          await cartService.mergeLocalCart(
            pendentes.map((i) => ({ idProduto: i.produtoId, quantidade: i.quantidade })),
          );
        }
        const carrinho = await cartService.getCart();
        setRemote({ email, items: fromApi(carrinho) });
        if (pendentes.length) {
          save([]);
          setLocal([]);
        }
      } catch (error) {
        mergedFor.current = null;
        toast.error(getErrorMessage(error));
      }
    })();
  }, [email]);

  const refresh = React.useCallback(async (owner: string) => {
    setRemote({ email: owner, items: fromApi(await cartService.getCart()) });
  }, []);

  const addItem = React.useCallback(
    async (produtoId: number, quantidade = 1, extra?: { nome?: string; preco?: number }) => {
      const owner = sessionEmail();
      if (owner) {
        await cartService.addItem(produtoId, quantidade);
        await refresh(owner);
        return;
      }
      setLocal((prev) => {
        const next = prev.some((i) => i.produtoId === produtoId)
          ? prev.map((i) =>
              i.produtoId === produtoId
                ? {
                    ...i,
                    quantidade: i.quantidade + quantidade,
                    nome: extra?.nome ?? i.nome,
                    preco: extra?.preco ?? i.preco,
                  }
                : i,
            )
          : [...prev, { produtoId, quantidade, nome: extra?.nome, preco: extra?.preco }];
        save(next);
        return next;
      });
    },
    [refresh],
  );

  const removeItem = React.useCallback(
    async (produtoId: number) => {
      const owner = sessionEmail();
      if (owner) {
        await cartService.removeItem(produtoId);
        await refresh(owner);
        return;
      }
      setLocal((prev) => {
        const next = prev.filter((i) => i.produtoId !== produtoId);
        save(next);
        return next;
      });
    },
    [refresh],
  );

  const clearCart = React.useCallback(() => {
    save([]);
    setLocal([]);
    if (email) {
      setRemote({ email, items: [] });
    }
  }, [email]);

  const value = React.useMemo(() => {
    const items = email ? (remote?.email === email ? remote.items : []) : local;
    return { items, addItem, removeItem, clearCart };
  }, [email, remote, local, addItem, removeItem, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
