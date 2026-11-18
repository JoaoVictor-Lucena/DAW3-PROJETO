"use client";

import * as React from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import type { Role } from "@/types";

export type PendingAction = () => void | Promise<void>;

export interface UseRequireAuth {
  requireAuth: () => boolean;
  onLoginSuccess: (loggedUser?: { role: Role }) => void;
  isRoleBlocked: boolean;
}

const BLOCKED_ROLES: readonly Role[] = ["VENDEDOR", "ADMIN"];
export const BLOCKED_MESSAGE = "Ação não permitida para este perfil";

const isBlocked = (role?: Role) => !!role && BLOCKED_ROLES.includes(role);

export function useRequireAuth(acao: PendingAction): UseRequireAuth {
  const { user } = useAuth();
  const { openLoginModal } = useModal();
  const pending = React.useRef<PendingAction | null>(null);
  const isRoleBlocked = isBlocked(user?.role);

  const onLoginSuccess = React.useCallback((loggedUser?: { role: Role }) => {
    const fn = pending.current;
    pending.current = null;
    if (!fn) return;
    if (isBlocked(loggedUser?.role)) {
      toast.error(BLOCKED_MESSAGE);
      return;
    }
    void fn();
  }, []);

  const requireAuth = React.useCallback(() => {
    if (!user) {
      pending.current = acao;
      openLoginModal(onLoginSuccess);
      return false;
    }
    if (isRoleBlocked) {
      toast.error(BLOCKED_MESSAGE);
      return false;
    }
    void acao();
    return true;
  }, [acao, user, isRoleBlocked, openLoginModal, onLoginSuccess]);

  return { requireAuth, onLoginSuccess, isRoleBlocked };
}
