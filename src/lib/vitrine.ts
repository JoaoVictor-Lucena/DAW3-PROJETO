import type { Produto } from "@/types";

export const LIMITE_SECAO = 12;

function timestamp(produto: Produto): number {
  const t = produto.dataCadastro ? Date.parse(produto.dataCadastro) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

export function novidades(produtos: Produto[], limite = LIMITE_SECAO): Produto[] {
  return [...produtos].sort((a, b) => timestamp(b) - timestamp(a)).slice(0, limite);
}

export function maisVendidos(produtos: Produto[], limite = LIMITE_SECAO): Produto[] {
  return [...produtos]
    .sort(
      (a, b) =>
        (b.totalAvaliacoes ?? 0) - (a.totalAvaliacoes ?? 0) ||
        (b.mediaAvaliacoes ?? 0) - (a.mediaAvaliacoes ?? 0),
    )
    .slice(0, limite);
}

export function ofertas(produtos: Produto[], limite = LIMITE_SECAO): Produto[] {
  return produtos
    .filter((p) => p.estoque > 0)
    .sort((a, b) => a.preco - b.preco)
    .slice(0, limite);
}

export interface LojaDestaque {
  id: number;
  nome: string;
  totalProdutos: number;
  totalAvaliacoes: number;
  media: number | null;
}

export function lojasEmDestaque(produtos: Produto[], limite = 8): LojaDestaque[] {
  const porLoja = new Map<number, LojaDestaque & { soma: number }>();

  for (const p of produtos) {
    const loja =
      porLoja.get(p.idVendedor) ??
      { id: p.idVendedor, nome: p.nomeVendedor, totalProdutos: 0, totalAvaliacoes: 0, media: null, soma: 0 };
    const avaliacoes = p.totalAvaliacoes ?? 0;
    loja.totalProdutos += 1;
    loja.totalAvaliacoes += avaliacoes;
    loja.soma += (p.mediaAvaliacoes ?? 0) * avaliacoes;
    porLoja.set(p.idVendedor, loja);
  }

  return [...porLoja.values()]
    .map(({ soma, ...loja }) => ({
      ...loja,
      media: loja.totalAvaliacoes > 0 ? soma / loja.totalAvaliacoes : null,
    }))
    .sort((a, b) => b.totalAvaliacoes - a.totalAvaliacoes || b.totalProdutos - a.totalProdutos)
    .slice(0, limite);
}
