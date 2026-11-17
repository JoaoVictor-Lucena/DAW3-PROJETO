import { PackagePlusIcon, PackageSearchIcon, ReceiptTextIcon } from "lucide-react";

import { PainelInicial } from "@/components/layout/PainelInicial";

/** Área logada: o conteúdo depende da sessão (localStorage) e só aparece no navegador,
 * então não entra na validação de navegação instantânea do Next. */
export const instant = false;

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
