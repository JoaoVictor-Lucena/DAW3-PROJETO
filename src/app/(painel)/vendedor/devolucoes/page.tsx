import VendedorDevolucoesPage from "./conteudo";

/** Área logada: o conteúdo depende da sessão (localStorage) e só aparece no navegador,
 * então não entra na validação de navegação instantânea do Next. */
export const instant = false;

export default function Page() {
  return <VendedorDevolucoesPage />;
}
