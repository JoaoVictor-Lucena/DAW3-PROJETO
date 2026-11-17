import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Page } from "@/types";

export function Paginacao<T>({
  page,
  disabled,
  onChange,
}: {
  page: Page<T> | undefined;
  disabled?: boolean;
  onChange: (pagina: number) => void;
}) {
  if (!page || page.totalElements === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Página {page.number + 1} de {Math.max(page.totalPages, 1)} · {page.totalElements}{" "}
        {page.totalElements === 1 ? "registro" : "registros"}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page.first}
          onClick={() => onChange(Math.max(page.number - 1, 0))}
        >
          <ChevronLeftIcon /> Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page.last}
          onClick={() => onChange(page.number + 1)}
        >
          Próxima <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
