import type { Metadata } from "next";

import DetalheProdutoPage from "./conteudo";
import { produtoService } from "@/services/produtoService";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const produto = await produtoService.buscarPorId(Number(id));
    const descricao =
      produto.descricao?.trim() || `Veja detalhes, preço e avaliações de ${produto.nome}.`;
    return {
      title: produto.nome,
      description: descricao.slice(0, 160),
    };
  } catch {
    // A API pode exigir login ou estar fora do ar: usa um título genérico.
    return { title: "Detalhes do produto", description: "Detalhes do produto no marketplace." };
  }
}

export const instant = false;

export default function Page() {
  return <DetalheProdutoPage />;
}
