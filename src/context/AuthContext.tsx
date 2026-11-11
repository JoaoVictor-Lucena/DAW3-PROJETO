"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { authService } from "@/services/authService";
import { SESSAO_EXPIRADA_EVENT, tokenStorage } from "@/services/api";
import type { LoginRequest, Role } from "@/types";

export interface AuthUser {
  id?: number;
  nome?: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  /** true logo depois de um logout voluntário, até a navegação mudar de rota. */
  saindo: boolean;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  logout: () => void;
}

const USER_KEY = "marketplace.user";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

function getSnapshot(): string {
  const user = window.localStorage.getItem(USER_KEY);
  const token = tokenStorage.get();
  return user && token ? JSON.stringify({ ...JSON.parse(user), token }) : "";
}

const getServerSnapshot = () => "";
const subscribeNoop = () => () => {};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const ready = React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const snapshot = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const session = React.useMemo(
    () => (snapshot ? (JSON.parse(snapshot) as AuthUser & { token: string }) : null),
    [snapshot],
  );
  const user = React.useMemo<AuthUser | null>(
    () =>
      session
        ? { id: session.id, nome: session.nome, email: session.email, role: session.role }
        : null,
    [session],
  );
  const token = session?.token ?? null;

  // Rota em que o usuário clicou em "Sair". Enquanto ainda estiver nela, os guards
  // não mandam para o login (o logout já está levando para a vitrine).
  const [saiuEm, setSaiuEm] = React.useState<string | null>(null);
  const saindo = saiuEm !== null && saiuEm === pathname;

  const login = React.useCallback(async (credentials: LoginRequest) => {
    const res = await authService.login(credentials);
    const nextUser: AuthUser = { id: res.id, nome: res.nome, email: res.email, role: res.role };
    tokenStorage.set(res.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setSaiuEm(null);
    emit();
    return nextUser;
  }, []);

  const limparSessao = React.useCallback(() => {
    tokenStorage.clear();
    window.localStorage.removeItem(USER_KEY);
    emit();
  }, []);

  const logout = React.useCallback(() => {
    setSaiuEm(pathname);
    limparSessao();
    router.replace("/");
  }, [limparSessao, pathname, router]);

  React.useEffect(() => {
    function onSessaoExpirada() {
      if (!window.localStorage.getItem(USER_KEY)) return;
      limparSessao();
      toast.warning("Sua sessão expirou. Entre novamente para continuar.");
    }
    window.addEventListener(SESSAO_EXPIRADA_EVENT, onSessaoExpirada);
    return () => window.removeEventListener(SESSAO_EXPIRADA_EVENT, onSessaoExpirada);
  }, [limparSessao]);

  const value = React.useMemo(
    () => ({ user, token, ready, saindo, login, logout }),
    [user, token, ready, saindo, login, logout],
  );

  // A sessão fica no localStorage: só renderiza depois de montar no cliente,
  // para não piscar a tela de "visitante" para quem já está logado.
  return (
    <AuthContext.Provider value={value}>{ready ? children : null}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
