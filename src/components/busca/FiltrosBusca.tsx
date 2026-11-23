"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { StarIcon, XIcon } from "lucide-react";

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
import {
  comMudanca,
  NOTAS_MINIMAS,
  semFiltros,
  urlBusca,
  type FiltrosBusca as Filtros,
  type ModoBusca,
} from "@/lib/busca";
import { formatCurrencyInput, numberToCurrencyInput, parseCurrencyInput } from "@/lib/format";
import type { Categoria } from "@/types";

export interface LojaOpcao {
  id: number;
  nome: string;
}

interface Props {
  filtros: Filtros;
  modo: ModoBusca;
  categorias: Categoria[];
  lojas: LojaOpcao[];
  onAplicado?: () => void;
}

const TODAS = "todas";
const QUALQUER_NOTA = "0";

function parsePreco(raw: string): number | undefined | "invalido" {
  const s = raw.trim();
  if (!s) return undefined;
  const n = parseCurrencyInput(s);
  return Number.isFinite(n) && n >= 0 ? n : "invalido";
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2 border-b pb-4 last:border-b-0">
      <legend className="mb-2 text-sm font-semibold">{titulo}</legend>
      {children}
    </fieldset>
  );
}

export function FiltrosBusca({ filtros, modo, categorias, lojas, onAplicado }: Props) {
  const router = useRouter();
  const uid = React.useId();

  const [categoria, setCategoria] = React.useState(
    filtros.categoria !== undefined ? String(filtros.categoria) : TODAS,
  );
  const [min, setMin] = React.useState(
    filtros.precoMin !== undefined ? numberToCurrencyInput(filtros.precoMin) : "",
  );
  const [max, setMax] = React.useState(
    filtros.precoMax !== undefined ? numberToCurrencyInput(filtros.precoMax) : "",
  );
  const [nota, setNota] = React.useState(String(filtros.notaMin ?? QUALQUER_NOTA));
  const [soEstoque, setSoEstoque] = React.useState(filtros.soEstoque);
  const [loja, setLoja] = React.useState(filtros.loja !== undefined ? String(filtros.loja) : TODAS);
  const [erro, setErro] = React.useState<string | null>(null);

  const lojaItems = React.useMemo(
    () => [{ value: TODAS, label: "Todas as lojas" }, ...lojas.map((l) => ({ value: String(l.id), label: l.nome }))],
    [lojas],
  );

  function aplicar(e: React.FormEvent) {
    e.preventDefault();
    const precoMin = parsePreco(min);
    const precoMax = parsePreco(max);
    if (precoMin === "invalido" || precoMax === "invalido") {
      setErro("Informe valores de preço válidos.");
      return;
    }
    if (precoMin !== undefined && precoMax !== undefined && precoMin > precoMax) {
      setErro("O preço mínimo não pode ser maior que o máximo.");
      return;
    }
    setErro(null);

    const proximo = comMudanca(filtros, {
      categoria: categoria === TODAS ? undefined : Number(categoria),
      precoMin,
      precoMax,
      notaMin: nota === QUALQUER_NOTA ? undefined : Number(nota),
      soEstoque,
      loja: loja === TODAS ? undefined : Number(loja),
    });
    router.push(urlBusca(proximo, modo), { scroll: false });
    onAplicado?.();
  }

  function limpar() {
    router.push(urlBusca(semFiltros(filtros, modo), modo), { scroll: false });
    onAplicado?.();
  }

  return (
    <form onSubmit={aplicar} className="space-y-4" aria-label="Filtros de produtos">
      <Secao titulo="Categoria">
        <div className="max-h-52 space-y-1 overflow-y-auto pr-1" role="radiogroup" aria-label="Categoria">
          {[{ id: TODAS, nome: "Todas as categorias" }, ...categorias.map((c) => ({ id: String(c.id), nome: c.nome }))].map(
            (c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
                <input
                  type="radio"
                  name={`${uid}-categoria`}
                  value={c.id}
                  checked={categoria === c.id}
                  onChange={() => setCategoria(c.id)}
                  className="size-4 accent-primary"
                />
                {c.nome}
              </label>
            ),
          )}
        </div>
      </Secao>

      <Secao titulo="Faixa de preço">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor={`${uid}-min`} className="text-xs text-muted-foreground">
              Mínimo (R$)
            </Label>
            <Input
              id={`${uid}-min`}
              inputMode="numeric"
              placeholder="0,00"
              value={min}
              aria-invalid={!!erro}
              onChange={(e) => setMin(formatCurrencyInput(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${uid}-max`} className="text-xs text-muted-foreground">
              Máximo (R$)
            </Label>
            <Input
              id={`${uid}-max`}
              inputMode="numeric"
              placeholder="0,00"
              value={max}
              aria-invalid={!!erro}
              onChange={(e) => setMax(formatCurrencyInput(e.target.value))}
            />
          </div>
        </div>
        {erro && (
          <p role="alert" className="text-xs text-destructive">
            {erro}
          </p>
        )}
      </Secao>

      <Secao titulo="Avaliação mínima">
        <div className="space-y-1" role="radiogroup" aria-label="Avaliação mínima">
          {NOTAS_MINIMAS.map((n) => (
            <label key={n} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
              <input
                type="radio"
                name={`${uid}-nota`}
                value={n}
                checked={nota === String(n)}
                onChange={() => setNota(String(n))}
                className="size-4 accent-primary"
              />
              <span className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    className={i < n ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5 text-muted-foreground/30"}
                  />
                ))}
              </span>
              <span>{n === 1 ? "1 estrela ou mais" : `${n} estrelas ou mais`}</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted">
            <input
              type="radio"
              name={`${uid}-nota`}
              value={QUALQUER_NOTA}
              checked={nota === QUALQUER_NOTA}
              onChange={() => setNota(QUALQUER_NOTA)}
              className="size-4 accent-primary"
            />
            Qualquer nota
          </label>
        </div>
      </Secao>

      <Secao titulo="Disponibilidade">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={soEstoque}
            onChange={(e) => setSoEstoque(e.target.checked)}
            className="size-4 accent-primary"
          />
          Somente com estoque
        </label>
      </Secao>

      {lojas.length > 0 && (
        <Secao titulo="Loja">
          <Select items={lojaItems} value={loja} onValueChange={(v) => setLoja(v ?? TODAS)}>
            <SelectTrigger className="w-full" aria-label="Filtrar por loja">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lojaItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Secao>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={limpar}>
          <XIcon /> Limpar
        </Button>
        <Button type="submit">Aplicar</Button>
      </div>
    </form>
  );
}
