"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontalIcon } from "lucide-react";

import { FiltrosBusca, type LojaOpcao } from "@/components/busca/FiltrosBusca";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  comMudanca,
  ORDENACAO_BUSCA_PADRAO,
  ORDENACOES_BUSCA,
  urlBusca,
  type FiltrosBusca as Filtros,
  type ModoBusca,
  type OrdenacaoBusca,
} from "@/lib/busca";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Categoria } from "@/types";

interface Props {
  filtros: Filtros;
  modo: ModoBusca;
  categorias: Categoria[];
  lojas: LojaOpcao[];
  totalResultados: number;
  filtrosAtivos: number;
}

export function BarraResultados({ filtros, modo, categorias, lojas, totalResultados, filtrosAtivos }: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [drawerAberto, setDrawerAberto] = React.useState(false);

  function ordenar(valor: OrdenacaoBusca) {
    startTransition(() =>
      router.push(urlBusca(comMudanca(filtros, { ordenar: valor }), modo), { scroll: false }),
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3" aria-busy={pending}>
      <div className="flex items-center gap-3">
        {/* Drawer de filtros: só abaixo de lg (acima disso a sidebar fica sempre visível). */}
        <Sheet open={drawerAberto} onOpenChange={setDrawerAberto}>
          <SheetTrigger render={<Button variant="outline" className="lg:hidden" />}>
            <SlidersHorizontalIcon />
            Filtros{filtrosAtivos > 0 ? ` (${filtrosAtivos})` : ""}
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription className="sr-only">
                Refine os produtos por categoria, preço, avaliação, estoque e loja
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6">
              <FiltrosBusca
                filtros={filtros}
                modo={modo}
                categorias={categorias}
                lojas={lojas}
                onAplicado={() => setDrawerAberto(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {totalResultados} {totalResultados === 1 ? "resultado" : "resultados"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">Ordenar por</span>
        <Select
          items={ORDENACOES_BUSCA}
          value={filtros.ordenar}
          onValueChange={(v) => ordenar((v ?? ORDENACAO_BUSCA_PADRAO) as OrdenacaoBusca)}
        >
          <SelectTrigger className="w-44" aria-label="Ordenar produtos" disabled={pending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDENACOES_BUSCA.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
