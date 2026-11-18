import { HeartIcon, PackageIcon, ShoppingBagIcon } from "lucide-react";

import { PainelInicial } from "@/components/layout/PainelInicial";

/** Área logada: o conteúdo depende da sessão (localStorage) e só aparece no navegador,
 * então não entra na validação de navegação instantânea do Next. */
export const instant = false;

export default function ContaPage() {
  return (
    <PainelInicial
      titulo="Minha conta"
      descricao="Área do cliente: acompanhe suas compras."
      atalhos={[
        {
          href: "/produtos",
          titulo: "Continuar comprando",
          descricao: "Navegue pelo catálogo do marketplace.",
          Icon: ShoppingBagIcon,
        },
        {
          href: "/conta/favoritos",
          titulo: "Lista de desejos",
          descricao: "Produtos que você salvou para comprar depois.",
          Icon: HeartIcon,
        },
        {
          titulo: "Meus pedidos",
          descricao: "Em breve: pedidos, status e rastreio.",
          Icon: PackageIcon,
        },
      ]}
    />
  );
}
