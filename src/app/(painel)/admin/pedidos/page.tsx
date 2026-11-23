import type { Metadata } from "next";

import AdminPedidosPage from "./conteudo";

export const metadata: Metadata = { title: "Admin · Pedidos" };

/** Área logada: o conteúdo depende da sessão (localStorage) e só aparece no navegador,
 * então não entra na validação de navegação instantânea do Next. */
export const instant = false;

export default function Page() {
  return <AdminPedidosPage />;
}
