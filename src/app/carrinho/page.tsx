import type { Metadata } from "next";

import CarrinhoPage from "./conteudo";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revise os itens do seu carrinho antes de finalizar a compra.",
};

export const instant = false;

export default function Page() {
  return <CarrinhoPage />;
}
