import type { Metadata } from "next";

import EditarProdutoPage from "./conteudo";

export const metadata: Metadata = {
  title: "Editar produto",
  description: "Atualize os dados do produto.",
};

export const instant = false;

export default function Page() {
  return <EditarProdutoPage />;
}
