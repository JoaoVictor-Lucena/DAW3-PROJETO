import type { Metadata } from "next";

import { PaginaBusca } from "@/components/busca/PaginaBusca";
import type { SearchParams } from "@/lib/busca";

export const metadata: Metadata = {
  title: "Busca",
  description: "Busque produtos e refine por categoria, preço, avaliação, estoque e loja.",
};

export default function BuscaPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <PaginaBusca modo="busca" searchParams={searchParams} />;
}
