"use client";

import * as React from "react";
import { SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format";
import type { Categoria } from "@/types";

export type SortKey =
  | "none"
  | "preco-asc"
  | "preco-desc"
  | "nome-asc"
  | "estoque-asc"
  | "estoque-desc";

const SORT_ITEMS: { value: SortKey; label: string }[] = [
  { value: "none", label: "Sem ordenação" },
  { value: "preco-asc", label: "Preço: menor" },
  { value: "preco-desc", label: "Preço: maior" },
  { value: "nome-asc", label: "Nome (A-Z)" },
  { value: "estoque-asc", label: "Estoque: menor" },
  { value: "estoque-desc", label: "Estoque: maior" },
];

export interface FiltrosAplicados {
  nome?: string;
  idCategoria?: number;
  precoMin?: number;
  precoMax?: number;
}

interface Props {
  categorias: Categoria[];
  sort: SortKey;
  disabled?: boolean;
  onApply: (filtros: FiltrosAplicados) => void;
  onSortChange: (sort: SortKey) => void;
  onClear: () => void;
}

const TODAS = "todas";

function parsePreco(raw: string): number | undefined | "invalid" {
  const s = raw.trim();
  if (!s) return undefined;
  const n = parseCurrencyInput(s);
  return Number.isFinite(n) && n >= 0 ? n : "invalid";
}

export function ProductFilters({
  categorias,
  sort,
  disabled,
  onApply,
  onSortChange,
  onClear,
}: Props) {
  const [nome, setNome] = React.useState("");
  const [categoria, setCategoria] = React.useState(TODAS);
  const [min, setMin] = React.useState("");
  const [max, setMax] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);

  const categoriaItems = React.useMemo(
    () => [
      { value: TODAS, label: "Todas as categorias" },
      ...categorias.map((c) => ({ value: String(c.id), label: c.nome })),
    ],
    [categorias],
  );

  function apply(nextCategoria = categoria) {
    const precoMin = parsePreco(min);
    const precoMax = parsePreco(max);
    if (precoMin === "invalid" || precoMax === "invalid") {
      setErro("Informe valores de preço válidos (maiores ou iguais a 0).");
      return;
    }
    if (precoMin !== undefined && precoMax !== undefined && precoMin > precoMax) {
      setErro("O preço mínimo não pode ser maior que o máximo.");
      return;
    }
    setErro(null);
    onApply({
      nome: nome.trim() || undefined,
      idCategoria: nextCategoria === TODAS ? undefined : Number(nextCategoria),
      precoMin,
      precoMax,
    });
  }

  function clear() {
    setNome("");
    setCategoria(TODAS);
    setMin("");
    setMax("");
    setErro(null);
    onClear();
  }

  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="f-nome">Nome</Label>
          <Input
            id="f-nome"
            placeholder="Buscar por nome..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select
            items={categoriaItems}
            value={categoria}
            onValueChange={(v) => {
              const next = v ?? TODAS;
              setCategoria(next);
              apply(next);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoriaItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="f-min">Preço mínimo (R$)</Label>
          <Input
            id="f-min"
            inputMode="numeric"
            placeholder="0,00"
            value={min}
            aria-invalid={!!erro}
            onChange={(e) => setMin(formatCurrencyInput(e.target.value))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="f-max">Preço máximo (R$)</Label>
          <Input
            id="f-max"
            inputMode="numeric"
            placeholder="0,00"
            value={max}
            aria-invalid={!!erro}
            onChange={(e) => setMax(formatCurrencyInput(e.target.value))}
          />
        </div>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full space-y-1.5 sm:w-auto">
          <Label>Ordenar (página atual)</Label>
          <Select
            items={SORT_ITEMS}
            value={sort}
            onValueChange={(v) => onSortChange((v ?? "none") as SortKey)}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button type="button" variant="outline" onClick={clear} disabled={disabled}>
            <XIcon className="size-4" />
            Limpar filtros
          </Button>
          <Button type="submit" disabled={disabled}>
            <SearchIcon className="size-4" />
            Filtrar
          </Button>
        </div>
      </div>
    </form>
  );
}
