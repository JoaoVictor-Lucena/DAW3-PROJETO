const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
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
