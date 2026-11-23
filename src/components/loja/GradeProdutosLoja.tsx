"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PackageOpenIcon } from "lucide-react";

import { Paginacao } from "@/components/admin/Paginacao";
import { ProductCard } from "@/components/produtos/ProductCard";
import type { Page, Produto } from "@/types";

const SEM_ACAO = () => {};

/** Grade responsiva de produtos da loja, com estado vazio e paginação refletida na URL (?pagina=N). */
export function GradeProdutosLoja({ page }: { page: Page<Produto> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = React.useTransition();

  function irParaPagina(numero: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (numero > 0) params.set("pagina", String(numero + 1));
    else params.delete("pagina");
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: true }));
  }

  if (page.content.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <PackageOpenIcon className="size-10 text-muted-foreground" />
        <p className="text-lg font-semibold">Nenhum produto encontrado nesta loja</p>
        <p className="text-sm text-muted-foreground">
          Tente outra categoria ou volte mais tarde para conferir as novidades.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" aria-busy={pending}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {page.content.map((p) => (
          <ProductCard key={p.id} produto={p} canEdit={false} onDelete={SEM_ACAO} />
        ))}
      </div>
      <Paginacao page={page} disabled={pending} onChange={irParaPagina} />
    </div>
  );
}
