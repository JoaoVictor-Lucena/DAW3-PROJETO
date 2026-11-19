"use client";

import * as React from "react";
import { PackageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Miniatura do produto; sem imagem, ou se ela falhar ao carregar, mostra um ícone. */
export function MiniaturaProduto({ src, className }: { src: string | null; className?: string }) {
  const [falhou, setFalhou] = React.useState<string | null>(null);
  const mostrarImagem = !!src && falhou !== src;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted",
        className,
      )}
    >
      {mostrarImagem ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          className="size-full object-cover"
          onError={() => setFalhou(src)}
        />
      ) : (
        <PackageIcon className="size-1/2 text-muted-foreground" aria-hidden />
      )}
    </div>
  );
}
