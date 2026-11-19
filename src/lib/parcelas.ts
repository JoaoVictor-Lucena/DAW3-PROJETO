export const MAX_PARCELAS = 12;

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function textoParcelamento(preco: number, parcelas = MAX_PARCELAS): string | null {
  if (!Number.isFinite(preco) || preco <= 0) return null;
  return `${parcelas}x de ${brl.format(preco / parcelas)}`;
}
