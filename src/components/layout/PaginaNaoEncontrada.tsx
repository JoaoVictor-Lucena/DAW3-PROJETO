import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

/**
 * Conteúdo da página 404. Fica separado dos `not-found.tsx` porque dentro da loja o layout já
 * desenha header, rodapé e o `<main>`; fora dela, o `not-found.tsx` da raiz precisa desenhá-los.
 */
export function PaginaNaoEncontrada() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <SearchXIcon className="size-12 text-muted-foreground" aria-hidden />
      <p className="text-sm font-semibold text-muted-foreground">Erro 404</p>
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        O endereço pode estar incorreto ou a página foi removida. Volte para a loja e continue navegando.
      </p>
      <Link href="/produtos" className={buttonVariants()}>
        Ver produtos
      </Link>
    </div>
  );
}
