import * as React from "react";
import Image from "next/image";
import { CalendarIcon, PackageIcon, StarIcon, StoreIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VendedorPublico } from "@/types";

interface BannerLojaProps {
  vendedor: VendedorPublico;
}

function formatarDataCadastro(data?: string): string {
  if (!data) return "Data não informada";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return data;
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(d);
}

function AvaliacaoEstrelas({
  media,
  total,
}: {
  media?: number | null;
  total?: number;
}) {
  const temAvaliacao = typeof media === "number" && !Number.isNaN(media);
  const notaFormatada = temAvaliacao ? media.toFixed(1) : null;
  const notaArredondada = temAvaliacao ? Math.round(media) : 0;

  return (
    <div className="flex items-center gap-1.5" aria-label={`Avaliação: ${notaFormatada ?? "sem avaliações"}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const preenchida = i < notaArredondada;
          return (
            <StarIcon
              key={i}
              className={`size-4 ${
                preenchida
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          );
        })}
      </div>
      {temAvaliacao ? (
        <span className="text-sm font-semibold text-foreground">
          {notaFormatada}
          {typeof total === "number" && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              ({total} {total === 1 ? "avaliação" : "avaliações"})
            </span>
          )}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Sem avaliações</span>
      )}
    </div>
  );
}

export function BannerLoja({ vendedor }: BannerLojaProps) {
  const capaUrl = vendedor.bannerUrl || vendedor.banner || vendedor.imagemUrl;
  const nomeLoja = vendedor.nomeLoja || vendedor.nome || vendedor.razaoSocial || "Loja do Vendedor";
  const totalProdutos = vendedor.totalProdutos ?? 0;

  return (
    <section className="relative overflow-hidden border-b bg-card">
      {/* Imagem de Capa / Background */}
      <div className="relative h-44 w-full bg-gradient-to-r from-primary/15 via-primary/5 to-muted sm:h-56">
        {capaUrl && (
          <Image
            src={capaUrl}
            alt={`Capa de ${nomeLoja}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Conteúdo Informativo sobreposto e abaixo da capa */}
      <div className="container mx-auto px-4 pb-6">
        <div className="relative -mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
          {/* Logo / Avatar e Títulos */}
          <div className="flex items-end gap-4">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-muted shadow-md sm:size-28">
              <StoreIcon className="size-12 text-primary" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {nomeLoja}
                </h1>
                {vendedor.lojaAberta === false && (
                  <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
                    Loja Fechada Temporariamente
                  </Badge>
                )}
              </div>

              {vendedor.descricao && (
                <p className="max-w-2xl text-sm text-muted-foreground line-clamp-2">
                  {vendedor.descricao}
                </p>
              )}
            </div>
          </div>

          {/* Métricas e Detalhes da Loja */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-background/80 p-3 shadow-sm backdrop-blur sm:gap-6">
            {/* Avaliações */}
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground">Avaliações</span>
              <AvaliacaoEstrelas media={vendedor.mediaAvaliacoes} total={vendedor.totalAvaliacoes} />
            </div>

            <div className="h-8 w-px bg-border" />

            {/* Total de Produtos */}
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground">Produtos</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <PackageIcon className="size-4 text-primary" />
                <span>
                  {totalProdutos} {totalProdutos === 1 ? "produto" : "produtos"}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-border" />

            {/* Data de Cadastro */}
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground">Membro desde</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <CalendarIcon className="size-4 text-primary" />
                <span>{formatarDataCadastro(vendedor.dataCadastro)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
