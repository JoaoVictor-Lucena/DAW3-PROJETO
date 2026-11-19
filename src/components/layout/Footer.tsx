import Link from "next/link";
import {
  Banknote,
  CreditCard,
  QrCode,
  ShieldCheck,
  StoreIcon,
} from "lucide-react";

const INSTITUCIONAIS = [
  { label: "Sobre Nós", href: "#" },
  { label: "Termos de Uso", href: "#" },
  { label: "Política de Privacidade", href: "#" },
  { label: "Central de Ajuda", href: "#" },
];

const CATEGORIAS_MOCK = [
  { label: "Informática & Tecnologia", href: "/produtos" },
  { label: "Smartphones & Telefonia", href: "/produtos" },
  { label: "Moda & Vestuário", href: "/produtos" },
  { label: "Casa, Mesa & Banho", href: "/produtos" },
  { label: "Esportes & Lazer", href: "/produtos" },
];

const FORMAS_PAGAMENTO = [
  {
    icon: CreditCard,
    label: "Cartão de Crédito",
    info: "Em até 12x",
  },
  {
    icon: QrCode,
    label: "PIX",
    info: "Aprovação imediata",
  },
  {
    icon: Banknote,
    label: "Boleto Bancário",
    info: "À vista com desconto",
  },
  {
    icon: ShieldCheck,
    label: "Compra 100% Segura",
    info: "Dados protegidos",
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/25 text-foreground transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Coluna 1: Logo e descrição */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground"
            >
              <StoreIcon className="size-5 text-primary" />
              Marketplace
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sua melhor experiência de compras online. Encontre produtos incríveis,
              garantia de entrega e suporte dedicado para você e sua família.
            </p>
          </div>

          {/* Coluna 2: Institucionais */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Institucional
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {INSTITUCIONAIS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Categorias */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Categorias
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {CATEGORIAS_MOCK.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4: Formas de Pagamento */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Formas de Pagamento
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {FORMAS_PAGAMENTO.map((pag) => {
                const Icon = pag.icon;
                return (
                  <div
                    key={pag.label}
                    className="flex items-center gap-2.5 rounded-md border bg-card/60 p-2 text-xs shadow-xs transition-colors"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground block">
                        {pag.label}
                      </span>
                      <span className="text-muted-foreground text-[11px] block">
                        {pag.info}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Linha divisória inferior e direitos autorais */}
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:flex sm:items-center sm:justify-between">
          <p>© 2026 Marketplace. Todos os direitos reservados.</p>
          <p className="mt-2 sm:mt-0">
            Desenvolvido para a disciplina de DAW III.
          </p>
        </div>
      </div>
    </footer>
  );
}
