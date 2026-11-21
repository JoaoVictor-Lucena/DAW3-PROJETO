
export type SearchParams = Record<string, string | string[] | undefined>;

export type ModoBusca = "busca" | "categoria";

export const TAMANHO_PAGINA_BUSCA = 12;

export const ORDENACOES_BUSCA = [
  { value: "relevancia", label: "Mais relevantes", sort: undefined },
  { value: "recentes", label: "Mais recentes", sort: "dataCadastro,desc" },
  { value: "preco_asc", label: "Menor preço", sort: "preco,asc" },
  { value: "preco_desc", label: "Maior preço", sort: "preco,desc" },
  { value: "avaliacao", label: "Melhor avaliados", sort: "avaliacao,desc" },
] as const;

export type OrdenacaoBusca = (typeof ORDENACOES_BUSCA)[number]["value"];

export const ORDENACAO_BUSCA_PADRAO: OrdenacaoBusca = "relevancia";

export const NOTAS_MINIMAS = [4, 3, 2, 1] as const;

export interface FiltrosBusca {
  q?: string;
  categoria?: number;
  precoMin?: number;
  precoMax?: number;
  notaMin?: number;
  soEstoque: boolean;
  loja?: number;
  ordenar: OrdenacaoBusca;
  pagina: number;
}

export function parseOrdenacaoBusca(raw?: string): OrdenacaoBusca {
  return ORDENACOES_BUSCA.find((o) => o.value === raw)?.value ?? ORDENACAO_BUSCA_PADRAO;
}

export function ordenacaoBuscaParaSort(ordenacao: OrdenacaoBusca): string | undefined {
  return ORDENACOES_BUSCA.find((o) => o.value === ordenacao)?.sort;
}

function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

function inteiroPositivo(valor: string | undefined): number | undefined {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

function numeroNaoNegativo(valor: string | undefined): number | undefined {
  if (valor === undefined || valor.trim() === "") return undefined;
  const n = Number(valor.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseFiltros(sp: SearchParams, categoriaDoCaminho?: number): FiltrosBusca {
  const q = primeiro(sp.q)?.trim().slice(0, 100) || undefined;
  let precoMin = numeroNaoNegativo(primeiro(sp.precoMin));
  let precoMax = numeroNaoNegativo(primeiro(sp.precoMax));
  if (precoMin !== undefined && precoMax !== undefined && precoMin > precoMax) {
    [precoMin, precoMax] = [precoMax, precoMin];
  }
  const nota = inteiroPositivo(primeiro(sp.nota));

  return {
    q,
    categoria: categoriaDoCaminho ?? inteiroPositivo(primeiro(sp.categoria)),
    precoMin,
    precoMax,
    notaMin: nota !== undefined && nota <= 5 ? nota : undefined,
    soEstoque: primeiro(sp.estoque) === "1",
    loja: inteiroPositivo(primeiro(sp.loja)),
    ordenar: parseOrdenacaoBusca(primeiro(sp.ordenar)),
    pagina: inteiroPositivo(primeiro(sp.pagina)) ?? 1,
  };
}

export function urlBusca(f: FiltrosBusca, modo: ModoBusca): string {
  const categoriaNoCaminho = modo === "categoria" && f.categoria !== undefined;
  const params = new URLSearchParams();

  if (f.q) params.set("q", f.q);
  if (f.categoria !== undefined && !categoriaNoCaminho) params.set("categoria", String(f.categoria));
  if (f.precoMin !== undefined) params.set("precoMin", String(f.precoMin));
  if (f.precoMax !== undefined) params.set("precoMax", String(f.precoMax));
  if (f.notaMin !== undefined) params.set("nota", String(f.notaMin));
  if (f.soEstoque) params.set("estoque", "1");
  if (f.loja !== undefined) params.set("loja", String(f.loja));
  if (f.ordenar !== ORDENACAO_BUSCA_PADRAO) params.set("ordenar", f.ordenar);
  if (f.pagina > 1) params.set("pagina", String(f.pagina));

  const caminho = categoriaNoCaminho ? `/categoria/${f.categoria}` : "/busca";
  const qs = params.toString();
  return qs ? `${caminho}?${qs}` : caminho;
}

export function comMudanca(f: FiltrosBusca, mudanca: Partial<FiltrosBusca>): FiltrosBusca {
  return { ...f, pagina: 1, ...mudanca };
}

export function semFiltros(f: FiltrosBusca, modo: ModoBusca): FiltrosBusca {
  return {
    q: f.q,
    categoria: modo === "categoria" ? f.categoria : undefined,
    precoMin: undefined,
    precoMax: undefined,
    notaMin: undefined,
    soEstoque: false,
    loja: undefined,
    ordenar: f.ordenar,
    pagina: 1,
  };
}

export function contarFiltrosAtivos(f: FiltrosBusca, modo: ModoBusca): number {
  return [
    modo === "busca" && f.categoria !== undefined,
    f.precoMin !== undefined || f.precoMax !== undefined,
    f.notaMin !== undefined,
    f.soEstoque,
    f.loja !== undefined,
  ].filter(Boolean).length;
}
