"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Carrossel({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const trilho = React.useRef<HTMLDivElement>(null);
  const [pode, setPode] = React.useState({ esquerda: false, direita: false });
  const quantidade = React.Children.count(children);

  const atualizar = React.useCallback(() => {
    const el = trilho.current;
    if (!el) return;
    setPode({
      esquerda: el.scrollLeft > 4,
      direita: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  React.useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const observador = new ResizeObserver(atualizar);
    observador.observe(el);
    Array.from(el.children).forEach((filho) => observador.observe(filho));
    return () => observador.disconnect();
  }, [atualizar, quantidade]);

  function rolar(direcao: 1 | -1) {
    const el = trilho.current;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="group/carrossel relative" role="region" aria-label={ariaLabel}>
      <div
        ref={trilho}
        onScroll={atualizar}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {React.Children.map(children, (filho) => (
          <div className="flex w-[calc((100%-0.75rem)/2)] shrink-0 snap-start md:w-[calc((100%-2.25rem)/4)]">
            <div className="flex w-full flex-col">{filho}</div>
          </div>
        ))}
      </div>

      {pode.esquerda && (
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Voltar"
          onClick={() => rolar(-1)}
          className="absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-full shadow-md md:inline-flex"
        >
          <ChevronLeftIcon />
        </Button>
      )}
      {pode.direita && (
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Avançar"
          onClick={() => rolar(1)}
          className="absolute -right-4 top-1/2 hidden -translate-y-1/2 rounded-full shadow-md md:inline-flex"
        >
          <ChevronRightIcon />
        </Button>
      )}
    </div>
  );
}
