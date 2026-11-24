"use client";

import Link from "next/link";
import { HeartIcon, ShoppingCart, StoreIcon } from "lucide-react";

import { BuscaProdutos } from "@/components/layout/BuscaProdutos";
import { MenuCategorias } from "@/components/layout/MenuCategorias";
import { MenuMobile } from "@/components/layout/MenuMobile";
import { MenuUsuario } from "@/components/layout/MenuUsuario";
import { SinoNotificacoes } from "@/components/layout/SinoNotificacoes";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useFavoritos } from "@/context/FavoritosContext";
import { useModal } from "@/context/ModalContext";

function ContadorBadge({ valor }: { valor: number }) {
  if (valor <= 0) return null;
  return (
    <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 justify-center px-1 text-[10px]">
      {valor > 99 ? "99+" : valor}
    </Badge>
  );
}

export function Header() {
  const { user, ready } = useAuth();
  const { items } = useCart();
  const { disponivel: favoritosDisponivel, quantidade: qtdFavoritos } = useFavoritos();
  const { openLoginModal } = useModal();

  const cartCount = items.reduce((acc, item) => acc + item.quantidade, 0);
  const ehCliente = !user || user.role === "CLIENTE";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <MenuMobile />

        <Link href="/" className="flex items-center gap-2 font-semibold">
          <StoreIcon className="size-5" />
          <span className="hidden sm:inline">Marketplace</span>
        </Link>

        {/* Menu de Categorias e link fixo para o catálogo completo (Desktop) */}
        <div className="hidden md:flex items-center gap-1">
          <MenuCategorias />
          <Link href="/produtos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Produtos
          </Link>
        </div>

        {/* Busca: só no desktop (no mobile fica dentro do Sheet). */}
        <BuscaProdutos className="mx-auto hidden max-w-xl flex-1 md:flex" />

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5 md:ml-0">
          {/* Até ler a sessão, não mostra nada (evita piscar). */}
          {!ready ? (
            <div className="h-8 w-24 sm:w-40" aria-hidden />
          ) : (
            <>
              {favoritosDisponivel && (
                <Link
                  href="/conta/favoritos"
                  className={`${buttonVariants({ variant: "ghost", size: "icon" })} relative`}
                  aria-label={`Favoritos (${qtdFavoritos})`}
                >
                  <HeartIcon className="size-4" />
                  <ContadorBadge valor={qtdFavoritos} />
                </Link>
              )}

              {user && <SinoNotificacoes />}

              {ehCliente && (
                <Link
                  href="/carrinho"
                  className={`${buttonVariants({ variant: "ghost", size: "icon" })} relative`}
                  aria-label={`Carrinho com ${cartCount} itens`}
                >
                  <ShoppingCart className="size-4" />
                  <ContadorBadge valor={cartCount} />
                </Link>
              )}

              <ThemeToggle />

              {user ? (
                <MenuUsuario />
              ) : (
                <Button size="sm" onClick={() => openLoginModal()}>
                  Entrar
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
