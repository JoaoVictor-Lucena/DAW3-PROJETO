"use client";

import * as React from "react";
import { PackageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface GaleriaProdutoProps {
  nome: string;
  imagemUrl?: string | null;
  imagens?: string[];
}

export function GaleriaProduto({ nome, imagemUrl, imagens }: GaleriaProdutoProps) {
  const urls = React.useMemo(() => {
    const vistas = new Set<string>();
    const lista: string[] = [];
    for (const raw of [imagemUrl, ...(imagens ?? [])]) {
      const limpa = raw?.trim();
      if (limpa && !vistas.has(limpa)) {
        vistas.add(limpa);
        lista.push(limpa);
      }
    }
    return lista;
  }, [imagemUrl, imagens]);

  const [indice, setIndice] = React.useState(0);
  const [falhas, setFalhas] = React.useState<Record<string, boolean>>({});

  const indiceSeguro = indice < urls.length ? indice : 0;
  const urlPrincipal = urls[indiceSeguro];
  const mostrarPrincipal = !!urlPrincipal && !falhas[urlPrincipal];

  function marcarFalha(url: string) {
    setFalhas((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
  }

  return (
    <div className="space-y-3">
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border bg-muted">
        {mostrarPrincipal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urlPrincipal}
            alt={nome}
            className="size-full object-cover"
            onError={() => marcarFalha(urlPrincipal)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <PackageIcon className="size-16 opacity-50" aria-hidden />
            <span className="text-xs">Sem imagem disponível</span>
          </div>
        )}
      </div>

      {urls.length >= 2 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Miniaturas das imagens do produto"
        >
          {urls.map((url, i) => {
            const selecionada = i === indiceSeguro;
            const falhou = !!falhas[url];
            return (
              <button
                key={url}
                type="button"
                aria-label={`Ver imagem ${i + 1} de ${urls.length} de ${nome}`}
                aria-pressed={selecionada}
                onClick={() => setIndice(i)}
                className={cn(
                  "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-20",
                  selecionada
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-75 hover:opacity-100",
                )}
              >
                {!falhou ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                    onError={() => marcarFalha(url)}
                  />
                ) : (
                  <PackageIcon className="size-6 text-muted-foreground" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
