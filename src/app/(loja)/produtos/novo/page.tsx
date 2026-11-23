import type { Metadata } from "next";

import NovoProdutoPage from "./conteudo";

export const metadata: Metadata = {
  title: "Novo produto",
  description: "Cadastre um novo produto no marketplace.",
};

export const instant = false;

export default function Page() {
  return <NovoProdutoPage />;
}
