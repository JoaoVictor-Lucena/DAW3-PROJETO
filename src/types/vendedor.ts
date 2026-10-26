export interface Vendedor {
  id: number;
  nome: string;
  razaoSocial: string;
  cnpjCpf: string;
  email: string;
}

export interface VendedorRequest {
  nome: string;
  razaoSocial: string;
  cnpjCpf: string;
  email: string;
  senha: string;
}
