import { PackageSearchIcon, UsersIcon } from "lucide-react";

import { PainelInicial } from "@/components/layout/PainelInicial";

export default function AdminPage() {
  return (
    <PainelInicial
      titulo="Painel do administrador"
      descricao="Administração do marketplace. Seed e limpeza do banco ficam no topo da página."
      atalhos={[
        {
          href: "/produtos",
          titulo: "Catálogo",
          descricao: "Todos os produtos de todas as lojas.",
          Icon: PackageSearchIcon,
        },
        {
          titulo: "Usuários e métricas",
          descricao: "Em breve: gestão de usuários e métricas.",
          Icon: UsersIcon,
        },
      ]}
    />
  );
}
