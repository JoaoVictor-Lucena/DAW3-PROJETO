import type { Role } from "./auth";

export type Periodo = "7d" | "30d" | "12m";

export interface PontoSerie {
  periodo: string;
  faturamento: number;
  pedidos: number;
  novosUsuarios: number;
}

export interface VendedorRanking {
  idVendedor: number;
  nome: string;
  pedidos: number;
  faturamento: number;
}

export interface CategoriaRanking {
  idCategoria: number;
  nome: string;
  quantidadeVendida: number;
  faturamento: number;
}

export interface DashboardAdmin {
  periodo: Periodo;
  inicio: string;
  fim: string;
  gmv: number;
  totalPedidos: number;
  ticketMedio: number;
  pedidosPorStatus: Record<string, number>;
  novosUsuarios: { total: number; clientes: number; vendedores: number };
  topVendedores: VendedorRanking[];
  topCategorias: CategoriaRanking[];
  serie: PontoSerie[];
}

export interface UsuarioAdmin {
  id: number;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  dataCadastro: string;
}

export interface AdminRequest {
  nome: string;
  email: string;
  senha: string;
}

export type StatusCupom = "ATIVO" | "INATIVO";

export interface CupomAdmin {
  id: number;
  codigo: string;
  valorDesconto: number;
  dataExpiracao: string | null;
  status: StatusCupom;
}

export interface CupomRequest {
  codigo: string;
  valorDesconto: number;
  dataExpiracao?: string;
  status?: StatusCupom;
}
