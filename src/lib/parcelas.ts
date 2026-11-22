import { formatBRL } from "@/lib/format";

export const MAX_PARCELAS = 12;

export function textoParcelamento(preco: number, parcelas = MAX_PARCELAS): string | null {
  if (!Number.isFinite(preco) || preco <= 0) return null;
  return `${parcelas}x de ${formatBRL(preco / parcelas)}`;
}
