const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const decimal2 = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const dtFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatBRL(value: number): string {
  return brl.format(value);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dtFormat.format(d);
}

/**
 * Máscara monetária brasileira (2 casas decimais automáticas):
 * extrai os dígitos como centavos (ex: "29990" -> "299,90").
 */
export function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const cents = Number(digits);
  return decimal2.format(cents / 100);
}

/** Converte o texto mascarado ("299,90" ou "1.299,90") para number (299.9). */
export function parseCurrencyInput(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  if (!digits) return NaN;
  return Number(digits) / 100;
}

/** Formata um número decimal (ex: 299.9 vindo da API) para "299,90". */
export function numberToCurrencyInput(value: number): string {
  return decimal2.format(value);
}
