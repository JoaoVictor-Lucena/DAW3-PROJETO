"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  ShoppingCart,
  StoreIcon,
} from "lucide-react";

import { SinoNotificacoes } from "@/components/layout/SinoNotificacoes";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { loginComRedirect, painelDoPerfil } from "@/lib/auth-routes";

export function Header() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const pathname = usePathname();

  const cartCount = items.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <nav className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <StoreIcon className="size-5" />
            Marketplace
          </Link>
          <Link
            href="/produtos"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Produtos
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {(!user || user.role === "CLIENTE") && (
            <Link
              href="/carrinho"
              className={buttonVariants({ variant: "outline", size: "sm" })}
              aria-label={`Carrinho com ${cartCount} itens`}
            >
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                  {cartCount}
                </Badge>
              )}
            </Link>
          )}

          {user && (
            <>
              <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">
                {user.nome ?? user.email}
              </span>
              <Badge variant="secondary">{user.role}</Badge>
              <Link
                href={painelDoPerfil(user.role)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <LayoutDashboardIcon className="size-4" />
                <span className="hidden sm:inline">
                  {user.role === "CLIENTE" ? "Minha conta" : "Meu painel"}
                </span>
              </Link>
            </>
          )}

          {user && <SinoNotificacoes />}
          <ThemeToggle />

          {user ? (
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOutIcon className="size-4" />
              Sair
            </Button>
          ) : (
            <Link href={loginComRedirect(pathname)} className={buttonVariants({ size: "sm" })}>
              <LogInIcon className="size-4" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
