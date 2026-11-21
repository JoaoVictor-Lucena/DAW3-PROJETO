import type { Metadata } from "next";
import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="conteudo" tabIndex={-1}
        className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <SearchXIcon className="size-12 text-muted-foreground" aria-hidden />
        <p className="text-sm font-semibold text-muted-foreground">Erro 404</p>
        <h1 className="text-3xl font-bold">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O endereço pode estar incorreto ou a página foi removida. Volte para a loja e continue navegando.
        </p>
        <Link href="/produtos" className={buttonVariants()}>Ver produtos</Link>
      </main>
      <Footer />
    </div>
  );
}
