"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

/** Renderiza os filhos apenas para as roles permitidas; as demais voltam a /produtos com aviso. */
export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const allowed = !!user && allow.includes(user.role);

  React.useEffect(() => {
    if (user && !allowed) {
      toast.warning("Você não tem permissão para acessar esta página.");
      router.replace("/produtos");
    }
  }, [user, allowed, router]);

  return allowed ? <>{children}</> : null;
}
