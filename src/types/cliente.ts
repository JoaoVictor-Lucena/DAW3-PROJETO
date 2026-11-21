export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  dataCadastro: string;
}

export interface ClienteRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}

export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}

export interface AtualizarClienteRequest {
  nome?: string;
  telefone?: string;
  email?: string;
}

