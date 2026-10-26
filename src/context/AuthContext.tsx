"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { authService } from "@/services/authService";
import { tokenStorage } from "@/services/api";
import type { LoginRequest, Role } from "@/types";

export interface AuthUser {
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  /** false até a sessão do localStorage ser lida no cliente. */
  ready: boolean;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  logout: () => void;
}

const USER_KEY = "marketplace.user";
const LOGIN_PATH = "/login";
const HOME_PATH = "/produtos";

// --- store externo (localStorage) -------------------------------------------
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // sincroniza entre abas
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

/** Snapshot em string (estável entre leituras) — "" quando não há sessão. */
function getSnapshot(): string {
  const user = window.localStorage.getItem(USER_KEY);
  const token = tokenStorage.get();
  return user && token ? JSON.stringify({ ...JSON.parse(user), token }) : "";
}

const getServerSnapshot = () => "";
const subscribeNoop = () => () => {};

// ---------------------------------------------------------------------------
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
    () => (session ? { email: session.email, role: session.role } : null),
    [session],
  );
  const token = session?.token ?? null;

  const login = React.useCallback(async (credentials: LoginRequest) => {
    const res = await authService.login(credentials);
    const nextUser: AuthUser = { email: res.email, role: res.role };
    tokenStorage.set(res.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    emit();
    return nextUser;
  }, []);

  const logout = React.useCallback(() => {
    tokenStorage.clear();
    window.localStorage.removeItem(USER_KEY);
    emit();
  }, []);

  // Proteção de rotas: sem sessão -> /login; com sessão em /login -> /produtos
  const isLoginRoute = pathname === LOGIN_PATH;
  const redirectTo = !ready ? null : !user && !isLoginRoute ? LOGIN_PATH : user && isLoginRoute ? HOME_PATH : null;

  React.useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  const value = React.useMemo(
    () => ({ user, token, ready, login, logout }),
    [user, token, ready, login, logout],
  );

  const blocked = !ready || redirectTo !== null;

  return (
    <AuthContext.Provider value={value}>
      {blocked ? null : children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
