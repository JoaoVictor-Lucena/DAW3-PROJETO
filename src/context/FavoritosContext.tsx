"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { loginComRedirect } from "@/lib/auth-routes";
import { getErrorMessage } from "@/services/api";
import { favoritoService } from "@/services/favoritoService";

interface FavoritosContextValue {
  /** O coração só aparece para visitante (vai para o login) e cliente. */
  disponivel: boolean;
  isFavorito: (idProduto: number) => boolean;
  /** Quantidade de produtos favoritados (0 para visitante). */
  quantidade: number;
  alternar: (idProduto: number, nome?: string) => Promise<void>;
  /** Muda a cada alteração, para telas que listam favoritos saberem quando recarregar. */
  versao: number;
}

const FavoritosContext = React.createContext<FavoritosContextValue | null>(null);

type Estado = { idCliente: number | string; ids: Set<number> };

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [estado, setEstado] = React.useState<Estado | null>(null);
  const [versao, setVersao] = React.useState(0);

  const ehCliente = user?.role === "CLIENTE";
  const chaveCliente = ehCliente ? (user.id ?? user.email) : null;

  React.useEffect(() => {
    if (chaveCliente === null) return;
    let cancelado = false;
    favoritoService
      .ids()
      .then((ids) => !cancelado && setEstado({ idCliente: chaveCliente, ids: new Set(ids) }))
      .catch(() => !cancelado && setEstado({ idCliente: chaveCliente, ids: new Set() }));
    return () => {
      cancelado = true;
    };
  }, [chaveCliente]);

  const ids = React.useMemo(
    () => (estado && estado.idCliente === chaveCliente ? estado.ids : new Set<number>()),
    [estado, chaveCliente],
  );

  const isFavorito = React.useCallback((idProduto: number) => ids.has(idProduto), [ids]);

  const alternar = React.useCallback(
    async (idProduto: number, nome?: string) => {
      if (!user) {
        toast.info("Entre como cliente para salvar produtos na sua lista de desejos.");
        router.push(loginComRedirect(pathname));
        return;
      }
      if (!ehCliente || chaveCliente === null) return;

      const estava = ids.has(idProduto);
      const aplicar = (favoritar: boolean) =>
        setEstado((atual) => {
          const proximo = new Set(atual?.idCliente === chaveCliente ? atual.ids : []);
          if (favoritar) proximo.add(idProduto);
          else proximo.delete(idProduto);
          return { idCliente: chaveCliente, ids: proximo };
        });

      aplicar(!estava); // atualização otimista
      try {
        if (estava) await favoritoService.remover(idProduto);
        else await favoritoService.adicionar(idProduto);
        setVersao((v) => v + 1);
        toast.success(
          estava
            ? `${nome ? `"${nome}"` : "Produto"} saiu da lista de desejos.`
            : `${nome ? `"${nome}"` : "Produto"} foi para a lista de desejos.`,
        );
      } catch (error) {
        aplicar(estava);
        toast.error(getErrorMessage(error));
      }
    },
    [user, ehCliente, chaveCliente, ids, router, pathname],
  );

  const value = React.useMemo(
    () => ({ disponivel: !user || ehCliente, isFavorito, quantidade: ids.size, alternar, versao }),
    [user, ehCliente, isFavorito, ids, alternar, versao],
  );

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos(): FavoritosContextValue {
  const ctx = React.useContext(FavoritosContext);
  if (!ctx) throw new Error("useFavoritos deve ser usado dentro de <FavoritosProvider>");
  return ctx;
}
