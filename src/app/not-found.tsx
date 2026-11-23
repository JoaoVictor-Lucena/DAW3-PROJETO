import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PaginaNaoEncontrada } from "@/components/layout/PaginaNaoEncontrada";

export const metadata: Metadata = { title: "Página não encontrada" };

/** Endereço que não existe em nenhuma área: aqui não há layout de loja, então desenha tudo. */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="conteudo" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <PaginaNaoEncontrada />
      </main>
      <Footer />
    </div>
  );
}
