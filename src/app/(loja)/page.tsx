import type { Metadata } from "next";

import HomePage from "./conteudo";

export const metadata: Metadata = {
  title: "Início",
  description: "Ofertas, mais vendidos, novidades e lojas em destaque do marketplace.",
};

export default function Page() {
  return <HomePage />;
}
