import { api } from "@/services/api";
import type {
  AuthResponse,
  Cliente,
  ClienteRequest,
  LoginRequest,
  Vendedor,
  VendedorRequest,
} from "@/types";

export const authService = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/auth/login", data, { skipAuth: true }),

  registrarCliente: (data: ClienteRequest) =>
    api.post<Cliente>("/clientes", data, { skipAuth: true }),

  registrarVendedor: (data: VendedorRequest) =>
    api.post<Vendedor>("/vendedores", data, { skipAuth: true }),

  /**
   * Exclui a conta do usuário logado (qualquer perfil), confirmando a senha. O back-end recusa
   * se houver pedidos em andamento; com histórico, a conta é anonimizada em vez de apagada.
   */
  excluirConta: (senha: string) => api.delete<void>("/usuarios/me", { body: { senha } }),
};
