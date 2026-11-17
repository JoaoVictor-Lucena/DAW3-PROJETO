"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface OpcaoFiltro {
  value: string;
  label: string;
}

/** Select simples de filtro: valores em texto (use "" para "todos"). */
export function SelectFiltro({
  opcoes,
  value,
  onChange,
  className = "w-full sm:w-48",
  ariaLabel,
  disabled,
}: {
  opcoes: OpcaoFiltro[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      items={opcoes}
      value={value}
      disabled={disabled}
      onValueChange={(v) => onChange((v as string | null) ?? "")}
    >
      <SelectTrigger className={className} aria-label={ariaLabel}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opcoes.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
