import { InboxIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Mostra carregamento, erro ou lista vazia; quando há dados, renderiza `children`. */
export function EstadoLista({
  carregando,
  erro,
  vazio,
  mensagemVazia = "Nenhum registro encontrado.",
  onTentarDeNovo,
  children,
}: {
  carregando: boolean;
  erro?: string;
  vazio: boolean;
  mensagemVazia?: string;
  onTentarDeNovo: () => void;
  children: React.ReactNode;
}) {
  if (erro) {
    return (
      <div className="space-y-3 rounded-lg border border-dashed p-10 text-center">
        <p className="text-muted-foreground">{erro}</p>
        <Button variant="outline" onClick={onTentarDeNovo}>
          Tentar novamente
        </Button>
      </div>
    );
  }
  if (carregando && vazio) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Carregando">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (vazio) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
        <InboxIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{mensagemVazia}</p>
      </div>
    );
  }
  return (
    <div
      aria-busy={carregando}
      className={carregando ? "pointer-events-none opacity-60 transition-opacity" : undefined}
    >
      {children}
    </div>
  );
}
