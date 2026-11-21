"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { ChevronDownIcon, LayoutGridIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { categoriaService } from "@/services/categoriaService";
import type { Categoria } from "@/types";

const CATEGORIAS_FALLBACK: Categoria[] = [
  { id: 1, nome: "Informática", descricao: null },
  { id: 2, nome: "Smartphones", descricao: null },
  { id: 3, nome: "Moda", descricao: null },
  { id: 4, nome: "Casa e Decoração", descricao: null },
  { id: 5, nome: "Esportes", descricao: null },
];

export function useCategorias(): Categoria[] {
  const [categorias, setCategorias] = React.useState<Categoria[]>(CATEGORIAS_FALLBACK);

  React.useEffect(() => {
    let cancelado = false;
    categoriaService
      .listarTodas()
      .then((lista) => !cancelado && lista.length > 0 && setCategorias(lista))
      .catch(() => {}); // mantém o fallback
    return () => {
      cancelado = true;
    };
  }, []);

  return categorias;
}

export function MenuCategorias() {
  const categorias = useCategorias();

  return (
    <Menu.Root>
      <Menu.Trigger className={buttonVariants({ variant: "ghost", size: "sm" })}>
        <LayoutGridIcon className="size-4" />
        <span>Categorias</span>
        <ChevronDownIcon className="size-3.5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="start" sideOffset={8} className="z-50">
          <Menu.Popup className="max-h-80 min-w-52 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md outline-none">
            <Menu.LinkItem
              render={<Link href="/produtos" />}
              className="block rounded-md px-2.5 py-1.5 text-sm font-medium outline-none data-highlighted:bg-muted"
            >
              Todos os produtos
            </Menu.LinkItem>
            <Menu.Separator className="my-1 h-px bg-border" />
            {categorias.map((c) => (
              <Menu.LinkItem
                key={c.id}
                render={<Link href={`/categoria/${c.id}`} />}
                className="block rounded-md px-2.5 py-1.5 text-sm outline-none data-highlighted:bg-muted"
              >
                {c.nome}
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
