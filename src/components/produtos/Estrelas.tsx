import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Estrelas({
  media,
  total,
  className,
}: {
  media?: number | null;
  total?: number;
  className?: string;
}) {
  const quantidade = total ?? 0;
  const nota = quantidade > 0 && media ? Math.round(media) : 0;
  const rotulo =
    quantidade > 0
      ? `Nota ${(media ?? 0).toFixed(1)} de 5, ${quantidade} ${quantidade === 1 ? "avaliação" : "avaliações"}`
      : "Sem avaliações";

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={rotulo}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon
            key={i}
            className={cn(
              "size-3.5",
              i < nota ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground" aria-hidden>
        {quantidade > 0 ? `(${quantidade})` : "Sem avaliações"}
      </span>
    </div>
  );
}
