"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

/** Tela de falha inesperada, usada pelos `error.tsx` de cada área. */
export function EstadoErro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center"
    >
      <TriangleAlertIcon className="size-12 text-destructive" aria-hidden />
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar esta página. Tente novamente; se o problema continuar,
        volte para o início.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Código do erro: {error.digest}</p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RefreshCwIcon /> Tentar novamente
        </Button>
        <Link href="/produtos" className={buttonVariants({ variant: "outline" })}>
          Ir para os produtos
        </Link>
      </div>
    </div>
  );
}
