"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const { user, saindo } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = !!user && allow.includes(user.role);

  React.useEffect(() => {
    if (allowed || saindo) return;
    if (!user) {
      router.replace(loginComRedirect(`${pathname}${window.location.search}`));
      return;
    }
    toast.warning("Você não tem permissão para acessar esta página.", {
      id: "sem-permissao",
    });
    router.replace(painelDoPerfil(user.role));
  }, [user, allowed, saindo, pathname, router]);

  return allowed ? <>{children}</> : null;
}
