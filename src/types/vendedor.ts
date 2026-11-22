import type { Periodo, PontoSerie } from "./admin";

export interface Vendedor {
  id: number;
  nome: string;
  razaoSocial: string;
  cnpjCpf: string;
  email: string;
  ativo?: boolean;
  dataCadastro?: string;
  descricao?: string | null;
  bannerUrl?: string | null;
  lojaAberta?: boolean;
}

export interface VendedorRequest {
  nome: string;
  razaoSocial: string;
  cnpjCpf: string;
  email: string;
  senha: string;
}

export interface PerfilLojaRequest {
  nome?: string;
  razaoSocial?: string;
  descricao?: string;
  bannerUrl?: string;
}

export interface ProdutoVendido {
  idProduto: number;
  nome: string;
  imagemUrl: string | null;
  quantidadeVendida: number;
  faturamento: number;
}

export interface ProdutoEstoqueBaixo {
  idProduto: number;
  nome: string;
  estoque: number;
  ativo: boolean;
}

export interface DashboardVendedor {
  periodo: Periodo;
  inicio: string;
  fim: string;
  faturamento: number;
  totalPedidos: number;
  ticketMedio: number;
  pedidosPorStatus: Record<string, number>;
  pedidosPorEtapa: Record<string, number>;
  serie: PontoSerie[];
  topProdutos: ProdutoVendido[];
  estoqueBaixo: ProdutoEstoqueBaixo[];
  mediaAvaliacoes: number | null;
  totalAvaliacoes: number;
}

export interface VendedorPublico {
  id: number;
  nome: string;
  razaoSocial: string;
  descricao?: string | null;
  bannerUrl?: string | null;
  totalProdutos: number;
  mediaAvaliacoes: number | null;
  totalAvaliacoes: number;
}
