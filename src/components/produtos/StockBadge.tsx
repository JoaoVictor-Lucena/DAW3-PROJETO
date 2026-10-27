import { Badge } from "@/components/ui/badge";

const ESTOQUE_BAIXO = 5;

export function StockBadge({ estoque }: { estoque: number }) {
  if (estoque <= 0) return <Badge variant="destructive">Esgotado</Badge>;
  if (estoque <= ESTOQUE_BAIXO) {
    return (
      <Badge
        variant="outline"
        className="border-amber-500 text-amber-600 dark:text-amber-400"
      >
        Baixo: {estoque}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-emerald-500 text-emerald-600 dark:text-emerald-400"
    >
      {estoque} em estoque
    </Badge>
  );
}
