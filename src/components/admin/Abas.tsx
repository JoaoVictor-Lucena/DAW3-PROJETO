"use client";

import { Button } from "@/components/ui/button";

/** Abas simples (segmented control) para alternar filtros no painel. */
export function Abas<T extends string>({
  abas,
  ativa,
  onChange,
  ariaLabel,
}: {
  abas: { value: T; label: string }[];
  ativa: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1"
      role="tablist"
      aria-label={ariaLabel}
    >
      {abas.map((aba) => (
        <Button
          key={aba.value}
          type="button"
          role="tab"
          size="sm"
          aria-selected={aba.value === ativa}
          variant={aba.value === ativa ? "default" : "ghost"}
          onClick={() => onChange(aba.value)}
        >
          {aba.label}
        </Button>
      ))}
    </div>
  );
}
