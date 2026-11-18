import { HeartIcon, PackageIcon, ShoppingBagIcon } from "lucide-react";

import { PainelInicial } from "@/components/layout/PainelInicial";

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
