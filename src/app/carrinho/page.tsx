"use client";

import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { buttonVariants } from "@/components/ui/button";

/** Placeholder temporário: a página real do carrinho vem da branch 2 (login sob demanda). */
export default function CarrinhoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 p-6 text-center">
        <ShoppingCartIcon className="size-14 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl font-semibold">Carrinho</h1>
        <p className="text-muted-foreground">Seu carrinho está vazio ou a página está em manutenção.</p>
        <Link href="/produtos" className={buttonVariants()}>
          Voltar aos produtos
        </Link>
      </main>
    </>
  );
}
