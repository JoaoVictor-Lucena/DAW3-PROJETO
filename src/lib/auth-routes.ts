import type { Role } from "@/types";

export const LOGIN_PATH = "/login";

/** Painel inicial de cada perfil. */
const PAINEL_POR_ROLE: Record<Role, string> = {
  CLIENTE: "/conta",
  VENDEDOR: "/vendedor",
  ADMIN: "/admin",
};

export function painelDoPerfil(role: Role): string {
  return PAINEL_POR_ROLE[role];
}

/** Para onde mandar o usuário depois do login, quando não há `?redirect=`. */
export function destinoAposLogin(role: Role): string {
  return role === "CLIENTE" ? "/" : painelDoPerfil(role);
}

/**
 * Aceita só caminhos internos (evita open redirect para outro domínio)
 * e ignora a própria tela de login.
 */
export function redirectSeguro(valor: string | null | undefined): string | null {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) {
    return null;
  }
  if (valor === LOGIN_PATH || valor.startsWith(`${LOGIN_PATH}?`)) return null;
  return valor;
}

export function loginComRedirect(destino: string): string {
  return `${LOGIN_PATH}?redirect=${encodeURIComponent(destino)}`;
}
