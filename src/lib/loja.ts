/** Ordenações da vitrine da loja: chave usada na URL (?ordenacao=...) e valor aceito pelo back-end (`sort`). */
export const ORDENACOES_LOJA = [
  { value: "recentes", label: "Mais recentes", sort: "dataCadastro,desc" },
  { value: "preco_asc", label: "Menor preço", sort: "preco,asc" },
  { value: "preco_desc", label: "Maior preço", sort: "preco,desc" },
  { value: "avaliacao", label: "Melhor avaliados", sort: "avaliacao,desc" },
] as const;

export type OrdenacaoLoja = (typeof ORDENACOES_LOJA)[number]["value"];

export const ORDENACAO_PADRAO: OrdenacaoLoja = "recentes";

export function parseOrdenacao(raw?: string): OrdenacaoLoja {
  return ORDENACOES_LOJA.find((o) => o.value === raw)?.value ?? ORDENACAO_PADRAO;
}

export function ordenacaoParaSort(ordenacao: OrdenacaoLoja): string {
  return ORDENACOES_LOJA.find((o) => o.value === ordenacao)?.sort ?? "dataCadastro,desc";
}
