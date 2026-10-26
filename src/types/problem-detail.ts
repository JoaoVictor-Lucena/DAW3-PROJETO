export type ProblemType =
  | "ERRO_DE_VALIDACAO"
  | "ENTIDADE_NAO_ENCONTRADA"
  | "CONFLITO"
  | "ESTADO_INVALIDO"
  | "ACESSO_NEGADO"
  | "NAO_AUTENTICADO"
  | "REQUISICAO_INVALIDA"
  | "ERRO_INESPERADO";

export interface ProblemDetail {
  type: ProblemType | string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp?: string;
  /** Mapa {campo: mensagem}, presente nos erros de validação. */
  erros?: Record<string, string>;
}
