"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDENACAO_PADRAO, ORDENACOES_LOJA, type OrdenacaoLoja } from "@/lib/loja";
import type { Categoria } from "@/types";

interface Props {
  categorias: Categoria[];
  ordenacao: OrdenacaoLoja;
  idCategoria?: number;
}

/** Ordenação e filtro por categoria da loja; o estado fica na URL e o Server Component recarrega os dados. */
export function FiltrosLoja({ categorias, ordenacao, idCategoria }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = React.useTransition();

  function atualizar(novo: { ordenacao?: OrdenacaoLoja; idCategoria?: number | null }) {
    const params = new URLSearchParams();
    const ord = novo.ordenacao ?? ordenacao;
    const cat = novo.idCategoria === undefined ? idCategoria : (novo.idCategoria ?? undefined);
    if (ord !== ORDENACAO_PADRAO) params.set("ordenacao", ord);
    if (cat !== undefined) params.set("categoria", String(cat));
    // Qualquer mudança de filtro/ordenação volta para a primeira página.
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  return (
    <div className="space-y-3" aria-busy={pending}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por categoria">
          <button type="button" onClick={() => atualizar({ idCategoria: null })} disabled={pending}>
            <Badge variant={idCategoria === undefined ? "default" : "outline"}>Todas</Badge>
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => atualizar({ idCategoria: idCategoria === c.id ? null : c.id })}
              disabled={pending}
              aria-pressed={idCategoria === c.id}
            >
              <Badge variant={idCategoria === c.id ? "default" : "outline"}>{c.nome}</Badge>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por</span>
          <Select
            items={ORDENACOES_LOJA}
            value={ordenacao}
            onValueChange={(v) => atualizar({ ordenacao: (v ?? ORDENACAO_PADRAO) as OrdenacaoLoja })}
          >
            <SelectTrigger className="w-44" disabled={pending}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDENACOES_LOJA.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
