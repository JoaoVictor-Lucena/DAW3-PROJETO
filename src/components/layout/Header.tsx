"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, LogInIcon, LogOutIcon, StoreIcon } from "lucide-react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { loginComRedirect, painelDoPerfil } from "@/lib/auth-routes";

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

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
