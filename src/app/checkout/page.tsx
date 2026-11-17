"use client";

import Link from "next/link";
import { CheckCircle2Icon, ShoppingBagIcon } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full text-center shadow-sm">
          <CardHeader className="space-y-3">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2Icon className="size-8" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                Pedido Realizado com sucesso!
              </CardTitle>
              <CardDescription>
                Agradecemos pela sua compra. Seu pedido foi recebido e já está sendo preparado.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Você pode acompanhar o andamento dos seus pedidos no seu painel ou continuar explorando outros itens.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/produtos"
              className={buttonVariants({ variant: "default", size: "lg", className: "w-full sm:w-auto" })}
            >
              <ShoppingBagIcon className="size-4" /> Voltar à loja
            </Link>
            <Link
              href="/conta"
              className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto" })}
            >
              Ver meus pedidos
            </Link>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
