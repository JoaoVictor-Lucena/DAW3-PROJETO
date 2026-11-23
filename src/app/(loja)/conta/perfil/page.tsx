import type { Metadata } from "next";

import PerfilPage from "./conteudo";

export const metadata: Metadata = {
  title: "Meu perfil",
  description: "Gerencie seus dados pessoais e sua senha.",
};

export const instant = false;

export default function Page() {
  return <PerfilPage />;
}
