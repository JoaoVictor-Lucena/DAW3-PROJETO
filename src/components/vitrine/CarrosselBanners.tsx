"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Banner = {
  titulo: string;
  subtitulo: string;
  cta: string;
  href: string;
  fundo: string;
};

const BANNERS: Banner[] = [
  {
    titulo: "Ofertas da semana",
    subtitulo: "Produtos selecionados com parcelamento em até 12x sem juros.",
    cta: "Ver ofertas",
    href: "/produtos",
    fundo: "from-indigo-600 via-violet-600 to-fuchsia-600",
  },
  {
    titulo: "Novidades na vitrine",
    subtitulo: "Os últimos lançamentos das lojas parceiras do marketplace.",
    cta: "Ver novidades",
    href: "/produtos",
    fundo: "from-emerald-600 via-teal-600 to-cyan-600",
  },
  {
    titulo: "Compre direto das lojas",
    subtitulo: "Descubra vendedores em destaque e encontre o que você procura.",
    cta: "Explorar produtos",
    href: "/produtos",
    fundo: "from-orange-500 via-rose-500 to-pink-600",
  },
];

const INTERVALO_MS = 5000;

export function CarrosselBanners({ banners = BANNERS }: { banners?: Banner[] }) {
  const [atual, setAtual] = React.useState(0);
  const [pausado, setPausado] = React.useState(false);
  const total = banners.length;

  const ir = React.useCallback((indice: number) => setAtual((indice + total) % total), [total]);

  React.useEffect(() => {
    if (pausado || total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setAtual((i) => (i + 1) % total), INTERVALO_MS);
    return () => window.clearInterval(id);
  }, [pausado, total]);

  if (total === 0) return null;

  return (
    <section
      role="region"
      aria-roledescription="carrossel"
      aria-label="Banners promocionais"
      className="relative overflow-hidden rounded-xl"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${atual * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <div
            key={banner.titulo}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${total}`}
            inert={i !== atual}
            className={cn(
              "flex min-h-48 w-full shrink-0 flex-col justify-center gap-3 bg-gradient-to-r px-8 py-10 text-white md:min-h-64 md:px-14",
              banner.fundo,
            )}
          >
            <h2 className="max-w-xl text-2xl font-bold md:text-4xl">{banner.titulo}</h2>
            <p className="max-w-xl text-sm text-white/90 md:text-base">{banner.subtitulo}</p>
            <div>
              <Link href={banner.href} className={buttonVariants({ variant: "secondary", size: "lg" })}>
                {banner.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            aria-label="Banner anterior"
            onClick={() => ir(atual - 1)}
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 md:inline-flex"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            aria-label="Próximo banner"
            onClick={() => ir(atual + 1)}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 md:inline-flex"
          >
            <ChevronRightIcon />
          </Button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {banners.map((banner, i) => (
              <button
                key={banner.titulo}
                type="button"
                aria-label={`Ir para o banner ${i + 1}`}
                aria-current={i === atual}
                onClick={() => ir(i)}
                className={cn(
                  "h-2 rounded-full bg-white transition-all",
                  i === atual ? "w-6" : "w-2 opacity-60 hover:opacity-100",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
