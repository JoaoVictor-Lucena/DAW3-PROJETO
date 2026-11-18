"use client";

import Link from "next/link";
import { PackageIcon } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { buttonVariants } from "@/components/ui/button";

export default function MeusPedidosPage() {
  return (
    <RoleGuard allow={["CLIENTE"]}>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 p-6 text-center">
        <PackageIcon className="size-14 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl font-semibold">Meus pedidos</h1>
        <p className="text-muted-foreground">
          Estamos preparando esta página. Em breve você poderá acompanhar aqui todas as suas compras.
        </p>
        <Link href="/produtos" className={buttonVariants()}>
          Continuar comprando
        </Link>
      </main>
    </RoleGuard>
  );
}
