"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { loginComRedirect, painelDoPerfil } from "@/lib/auth-routes";
import type { Role } from "@/types";

/**
 * Protege uma área do painel:
 * - visitante sem sessão vai para `/login?redirect=<rota atual>`;
 * - usuário logado com perfil errado volta para o próprio painel com um aviso.
 */
export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user, saindo, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = !!user && allow.includes(user.role);

  React.useEffect(() => {
    // Antes de ler a sessão do localStorage não dá para saber se o visitante está logado.
    if (!ready || allowed || saindo) return;
    if (!user) {
      router.replace(loginComRedirect(`${pathname}${window.location.search}`));
      return;
    }
    toast.warning("Você não tem permissão para acessar esta página.", {
      id: "sem-permissao",
    });
    router.replace(painelDoPerfil(user.role));
  }, [user, allowed, saindo, ready, pathname, router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-20" aria-busy="true">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" aria-label="Carregando" />
      </div>
    );
  }
  return allowed ? <>{children}</> : null;
}
