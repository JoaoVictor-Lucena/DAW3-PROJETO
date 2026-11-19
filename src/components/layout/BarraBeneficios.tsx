import { RotateCcw, ShieldCheck, Truck } from "lucide-react";

const BENEFICIOS = [
  {
    icon: Truck,
    titulo: "Frete Grátis",
    descricao: "Em pedidos selecionados para todo o Brasil",
  },
  {
    icon: ShieldCheck,
    titulo: "Pagamento Seguro",
    descricao: "Transações 100% protegidas e criptografadas",
  },
  {
    icon: RotateCcw,
    titulo: "Devolução Fácil",
    descricao: "Até 30 dias para troca ou devolução sem custo",
  },
];

export function BarraBeneficios() {
  return (
    <section
      aria-label="Benefícios da loja"
      className="border-b bg-muted/40 text-foreground transition-colors"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {BENEFICIOS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3.5 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-tight">
                    {item.titulo}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {item.descricao}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
