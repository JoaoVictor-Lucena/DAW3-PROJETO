import type { Metadata } from "next";

import ProdutosPage from "./conteudo";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Explore o catálogo do marketplace: filtre por categoria, preço e disponibilidade.",
};

/** Área que depende da sessão (localStorage): fica fora da validação de navegação instantânea. */
export const instant = false;

export default function Page() {
  return <ProdutosPage />;
}
