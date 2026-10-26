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
};
