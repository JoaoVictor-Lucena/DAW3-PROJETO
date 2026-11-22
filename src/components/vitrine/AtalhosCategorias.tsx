"use client";

import Link from "next/link";
import { LayoutGridIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCarregar } from "@/hooks/useCarregar";
import { iconeDaCategoria } from "@/lib/iconeCategoria";
import { categoriaService } from "@/services/categoriaService";

const MAX_ATALHOS = 12;

const CLASSE_ITEM = "flex w-20 shrink-0 flex-col items-center gap-2 text-center";
const CLASSE_CIRCULO =
  "flex size-16 items-center justify-center rounded-full bg-muted text-foreground transition-colors";
export function AtalhosCategorias() {
  const { dados: categorias, erro, carregando } = useCarregar("home-categorias", () =>
    categoriaService.listarTodas(),
  );

  if (erro || (!carregando && (categorias?.length ?? 0) === 0)) return null;

  return (
    <nav aria-label="Atalhos de categorias">
      <ul
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-busy={carregando}
      >
        {carregando
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className={CLASSE_ITEM} aria-hidden>
                <Skeleton className="size-16 rounded-full" />
                <Skeleton className="h-3 w-14" />
              </li>
            ))
          : (
            <>
              {categorias!.slice(0, MAX_ATALHOS).map((categoria) => {
                const Icone = iconeDaCategoria(categoria.nome);
                return (
                  <li key={categoria.id}>
                    <Link
                      href={`/produtos?categoria=${categoria.id}`}
                      className={`${CLASSE_ITEM} group outline-none`}
                    >
                      <span
                        className={`${CLASSE_CIRCULO} group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:ring-2 group-focus-visible:ring-ring`}
                      >
                        <Icone className="size-7" aria-hidden />
                      </span>
                      <span className="line-clamp-2 text-xs font-medium">{categoria.nome}</span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link href="/produtos" className={`${CLASSE_ITEM} group outline-none`}>
                  <span
                    className={`${CLASSE_CIRCULO} border border-dashed group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:ring-2 group-focus-visible:ring-ring`}
                  >
                    <LayoutGridIcon className="size-7" aria-hidden />
                  </span>
                  <span className="text-xs font-medium">Ver todas</span>
                </Link>
              </li>
            </>
          )}
      </ul>
    </nav>
  );
}
