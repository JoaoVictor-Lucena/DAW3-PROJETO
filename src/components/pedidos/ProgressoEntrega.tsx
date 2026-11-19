import { CheckIcon } from "lucide-react";

import { ETAPA_PEDIDO_LABEL } from "@/lib/admin-labels";
import { cn } from "@/lib/utils";
import type { EtapaPedido } from "@/types";

/** Fluxo normal de um pedido, do confirmado ao entregue. */
const FLUXO: readonly EtapaPedido[] = [
  "PEDIDO_CONFIRMADO",
  "PAGAMENTO_APROVADO",
  "EMBALADO",
  "EM_TRANSITO",
  "SAIU_PARA_ENTREGA",
  "ENTREGUE",
];

/**
 * Barra de progresso da entrega. `alcancadas` são as etapas que já aconteceram
 * (do histórico e a etapa atual); a mais avançada do fluxo define até onde a barra vai.
 */
export function ProgressoEntrega({ alcancadas }: { alcancadas: readonly EtapaPedido[] }) {
  const atual = Math.max(...alcancadas.map((e) => FLUXO.indexOf(e)), -1);

  return (
    <ol className="grid grid-cols-6 gap-1" aria-label="Progresso da entrega">
      {FLUXO.map((etapa, i) => {
        const feita = i <= atual;
        return (
          <li key={etapa} className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex w-full items-center">
              <span className={cn("h-0.5 flex-1", i === 0 ? "invisible" : feita ? "bg-primary" : "bg-border")} />
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  feita ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                  i === atual && "ring-4 ring-primary/20",
                )}
                aria-current={i === atual ? "step" : undefined}
              >
                {feita ? <CheckIcon className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "h-0.5 flex-1",
                  i === FLUXO.length - 1 ? "invisible" : i < atual ? "bg-primary" : "bg-border",
                )}
              />
            </div>
            <span
              className={cn(
                "text-[11px] leading-tight sm:text-xs",
                feita ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {ETAPA_PEDIDO_LABEL[etapa]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
