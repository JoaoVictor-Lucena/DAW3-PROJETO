import Link from "next/link";
import { XIcon } from "lucide-react";

import { comMudanca, semFiltros, urlBusca, type FiltrosBusca, type ModoBusca } from "@/lib/busca";
import { formatBRL } from "@/lib/format";
import type { Categoria } from "@/types";
import type { LojaOpcao } from "@/components/busca/FiltrosBusca";

interface Props {
  filtros: FiltrosBusca;
  modo: ModoBusca;
  categorias: Categoria[];
  lojas: LojaOpcao[];
}

interface Chip {
  chave: string;
  rotulo: string;
  href: string;
}

function rotuloPreco(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) return `${formatBRL(min)} – ${formatBRL(max)}`;
  if (min !== undefined) return `A partir de ${formatBRL(min)}`;
  return `Até ${formatBRL(max ?? 0)}`;
}

export function ChipsFiltros({ filtros: f, modo, categorias, lojas }: Props) {
  const chips: Chip[] = [];

  if (f.q) {
    chips.push({ chave: "q", rotulo: `Busca: “${f.q}”`, href: urlBusca(comMudanca(f, { q: undefined }), modo) });
  }
  if (f.categoria !== undefined && modo === "busca") {
    const nome = categorias.find((c) => c.id === f.categoria)?.nome ?? `Categoria ${f.categoria}`;
    chips.push({ chave: "categoria", rotulo: nome, href: urlBusca(comMudanca(f, { categoria: undefined }), modo) });
  }
  if (f.precoMin !== undefined || f.precoMax !== undefined) {
    chips.push({
      chave: "preco",
      rotulo: rotuloPreco(f.precoMin, f.precoMax),
      href: urlBusca(comMudanca(f, { precoMin: undefined, precoMax: undefined }), modo),
    });
  }
  if (f.notaMin !== undefined) {
    chips.push({
      chave: "nota",
      rotulo: `${f.notaMin}+ estrelas`,
      href: urlBusca(comMudanca(f, { notaMin: undefined }), modo),
    });
  }
  if (f.soEstoque) {
    chips.push({ chave: "estoque", rotulo: "Com estoque", href: urlBusca(comMudanca(f, { soEstoque: false }), modo) });
  }
  if (f.loja !== undefined) {
    const nome = lojas.find((l) => l.id === f.loja)?.nome ?? `Loja ${f.loja}`;
    chips.push({ chave: "loja", rotulo: nome, href: urlBusca(comMudanca(f, { loja: undefined }), modo) });
  }

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
      {chips.map((c) => (
        <li key={c.chave}>
          <Link
            href={c.href}
            scroll={false}
            aria-label={`Remover filtro: ${c.rotulo}`}
            className="inline-flex h-7 items-center gap-1 rounded-full border bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted"
          >
            {c.rotulo}
            <XIcon className="size-3" />
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={urlBusca(semFiltros(f, modo), modo)}
          scroll={false}
          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Limpar filtros
        </Link>
      </li>
    </ul>
  );
}
