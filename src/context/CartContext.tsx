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
  /** Carrinho completo do back-end (só para usuário logado), usado na revisão do checkout. */
  carrinho: Carrinho | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
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

/**
 * Depois de entrar, conta ao cliente o que aconteceu com o carrinho que ele montou como visitante.
 * O back-end soma as quantidades, limita ao estoque e ignora produtos que saíram da vitrine.
 */
function avisarMesclagem(pendentes: CartItem[], carrinho: Carrinho) {
  const noCarrinho = new Set(carrinho.itens.map((i) => i.idProduto));
  const fora = pendentes.filter((p) => !noCarrinho.has(p.produtoId)).length;
  if (fora === pendentes.length) {
    toast.warning("Os itens que você escolheu antes de entrar não estão mais disponíveis.");
    return;
  }
  toast.success("Os itens que você escolheu antes de entrar foram para o seu carrinho.");
  if (fora > 0) {
    toast.warning(
      fora === 1
        ? "1 item não está mais disponível e ficou de fora."
        : `${fora} itens não estão mais disponíveis e ficaram de fora.`,
    );
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
  const { user, ready } = useAuth();
  const email = user?.email ?? null;
  // Carrinho no back-end é exclusivo de CLIENTE; VENDEDOR/ADMIN não chamam a API (evita 403).
  const ehCliente = user?.role === "CLIENTE";
  const [local, setLocal] = React.useState<CartItem[]>(load);
  const [remote, setRemote] = React.useState<{ email: string; carrinho: Carrinho | null; erro?: string } | null>(null);

  const mergedFor = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!email || !ehCliente) {
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
        setRemote({ email, carrinho });
        if (pendentes.length) {
          save([]);
          setLocal([]);
          avisarMesclagem(pendentes, carrinho);
        }
      } catch (error) {
        mergedFor.current = null;
        setRemote({ email, carrinho: null, erro: getErrorMessage(error) });
        toast.error(getErrorMessage(error));
      }
    })();
  }, [email, ehCliente]);

  const refresh = React.useCallback(async (owner: string) => {
    setRemote({ email: owner, carrinho: await cartService.getCart() });
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
      setRemote({ email, carrinho: null });
    }
  }, [email]);

  const recarregar = React.useCallback(() => {
    if (email && ehCliente) void refresh(email).catch((error) => toast.error(getErrorMessage(error)));
  }, [email, ehCliente, refresh]);

  const value = React.useMemo<CartContextValue>(() => {
    const doUsuario = email && ehCliente && remote?.email === email ? remote : null;
    const carrinho = doUsuario?.carrinho ?? null;
    return {
      // Até ler a sessão no navegador, o carrinho fica vazio: igual ao HTML do servidor (sem hydration mismatch).
      items: !ready ? [] : email ? (ehCliente && carrinho ? fromApi(carrinho) : []) : local,
      carrinho,
      carregando: !!email && ehCliente && doUsuario === null,
      erro: doUsuario?.erro ?? null,
      recarregar,
      addItem,
      removeItem,
      clearCart,
    };
  }, [ready, email, ehCliente, remote, local, recarregar, addItem, removeItem, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
