import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Stepper({ passos, atual }: { passos: string[]; atual: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Etapas do checkout">
      {passos.map((titulo, i) => {
        const concluido = i < atual;
        const ativo = i === atual;
        return (
          <li key={titulo} className="flex flex-1 items-center gap-2" aria-current={ativo ? "step" : undefined}>
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                concluido && "border-primary bg-primary text-primary-foreground",
                ativo && "border-primary text-primary",
                !concluido && !ativo && "text-muted-foreground",
              )}
            >
              {concluido ? <CheckIcon className="size-4" /> : i + 1}
            </span>
            <span className={cn("text-sm", ativo ? "font-medium" : "text-muted-foreground")}>{titulo}</span>
            {i < passos.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
