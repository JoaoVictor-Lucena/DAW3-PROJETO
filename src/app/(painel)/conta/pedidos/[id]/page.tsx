import DetalhePedidoPage from "./conteudo";
import type { Metadata } from "next";
/** Área logada: o conteúdo depende da sessão (localStorage) e só aparece no navegador,
 * então não entra na validação de navegação instantânea do Next. */
export const metadata: Metadata = { title: "Detalhes do pedido" };
export const instant = false;

export default function Page() {
  return <DetalhePedidoPage />;
}
