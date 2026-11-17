export type Role = "ADMIN" | "VENDEDOR" | "CLIENTE";

export interface AuthResponse {
  token: string;
  role: Role;
  email: string;
  id: number;
  nome: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}
