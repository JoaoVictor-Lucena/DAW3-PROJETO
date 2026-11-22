"use client";

import * as React from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { BarraBeneficios } from "@/components/layout/BarraBeneficios";
import { BuscaProdutos } from "@/components/layout/BuscaProdutos";
import { useCategorias } from "@/components/layout/MenuCategorias";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Hambúrguer + Sheet lateral (só < md): busca, categorias e benefícios. */
export function MenuMobile() {
  const [aberto, setAberto] = React.useState(false);
  const categorias = useCategorias();
  const fechar = () => setAberto(false);

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu" />}
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Busca, categorias e benefícios da loja
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <BuscaProdutos onBuscar={fechar} />
        </div>

        <nav aria-label="Categorias" className="px-2">
          <h3 className="px-2 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Categorias
          </h3>
          <ul>
            <li>
              <Link
                href="/produtos"
                onClick={fechar}
                className="block rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
              >
                Todos os produtos
              </Link>
            </li>
            {categorias.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categoria/${c.id}`}
                  onClick={fechar}
                  className="block rounded-md px-2 py-2 text-sm hover:bg-muted"
                >
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto border-t">
          <BarraBeneficios />
        </div>
      </SheetContent>
    </Sheet>
  );
}
