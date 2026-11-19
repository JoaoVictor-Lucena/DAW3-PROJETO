"use client";

import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { LogOutIcon } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { painelDoPerfil } from "@/lib/auth-routes";

const ITEM =
  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none data-highlighted:bg-muted";

/** Avatar (iniciais) com o dropdown da conta. Só renderiza logado. */
export function MenuUsuario() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const nome = user.nome ?? user.email;
  const iniciais = nome
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Menu da conta"
        className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {iniciais}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="min-w-52 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none">
            <div className="px-2.5 py-1.5">
              <p className="truncate text-sm font-medium">{nome}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Menu.Separator className="my-1 h-px bg-border" />
            {user.role === "CLIENTE" && (
              <Menu.LinkItem render={<Link href="/conta" />} className={ITEM}>
                Minha conta
              </Menu.LinkItem>
            )}
            {user.role === "VENDEDOR" && (
              <Menu.LinkItem render={<Link href={painelDoPerfil("VENDEDOR")} />} className={ITEM}>
                Painel do vendedor
              </Menu.LinkItem>
            )}
            {user.role === "ADMIN" && (
              <Menu.LinkItem render={<Link href={painelDoPerfil("ADMIN")} />} className={ITEM}>
                Painel admin
              </Menu.LinkItem>
            )}
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item onClick={logout} className={`${ITEM} cursor-pointer text-destructive`}>
              <LogOutIcon className="size-4" />
              Sair
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
