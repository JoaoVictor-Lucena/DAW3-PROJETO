"use client";

import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notificacao } from "@/types";

/** Linha de notificação: ponto azul quando não lida; clicar marca como lida e abre o link. */
export function ItemNotificacao({
  notificacao,
  onAbrir,
}: {
  notificacao: Notificacao;
  onAbrir: (notificacao: Notificacao) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onAbrir(notificacao)}
      className={cn(
        "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
        !notificacao.lida && "bg-primary/5",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          notificacao.lida ? "bg-transparent" : "bg-sky-500",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm", !notificacao.lida && "font-semibold")}>
          {notificacao.titulo}
          {!notificacao.lida && <span className="sr-only"> (não lida)</span>}
        </span>
        <span className="block text-xs text-muted-foreground">{notificacao.mensagem}</span>
        <span className="block text-[11px] text-muted-foreground/80">
          {formatDateTime(notificacao.dataCriacao)}
        </span>
      </span>
    </button>
  );
}
