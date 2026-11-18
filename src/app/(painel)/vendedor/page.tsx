import { PackagePlusIcon, PackageSearchIcon, ReceiptTextIcon } from "lucide-react";

import { PainelInicial } from "@/components/layout/PainelInicial";

export default function VendedorPage() {
  return (
    <PainelInicial
      titulo="Painel do vendedor"
      descricao="Gerencie os produtos e os pedidos da sua loja."
      atalhos={[
        {
          href: "/produtos/novo",
          titulo: "Novo produto",
          descricao: "Cadastre um produto na sua loja.",
          Icon: PackagePlusIcon,
        },
        {
          href: "/produtos",
          titulo: "Catálogo",
          descricao: "Veja, edite e exporte os produtos.",
          Icon: PackageSearchIcon,
        },
        {
          titulo: "Pedidos recebidos",
          descricao: "Em breve: pedidos dos clientes e atualização de status.",
          Icon: ReceiptTextIcon,
        },
      ]}
    />
  );
}
