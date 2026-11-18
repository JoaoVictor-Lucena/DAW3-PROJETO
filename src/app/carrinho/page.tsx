"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, Loader2Icon, ShoppingCart, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/layout/Header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCart } from "@/context/CartContext";
import { BLOCKED_MESSAGE, useRequireAuth } from "@/hooks/useRequireAuth";
import { formatBRL } from "@/lib/format";
import { getErrorMessage } from "@/services/api";
import { produtoService } from "@/services/produtoService";
import type { Produto } from "@/types";

export default function CarrinhoPage() {
  const router = useRouter();
  const { items, removeItem } = useCart();
  const [detalhes, setDetalhes] = React.useState<Record<number, Produto>>({});
  const [removendoId, setRemovendoId] = React.useState<number | null>(null);

  // Busca detalhes de produtos cujos dados (nome/preço) ainda não estejam no item
  React.useEffect(() => {
    const idsFaltantes = items
      .map((i) => i.produtoId)
      .filter((id) => !detalhes[id]);

    if (idsFaltantes.length === 0) return;

    let cancelado = false;

    Promise.allSettled(idsFaltantes.map((id) => produtoService.buscarPorId(id)))
      .then((resultados) => {
        if (cancelado) return;
        const novos: Record<number, Produto> = {};
        resultados.forEach((res) => {
          if (res.status === "fulfilled" && res.value) {
            novos[res.value.id] = res.value;
          }
        });
        setDetalhes((prev) => ({ ...prev, ...novos }));
      });

    return () => {
      cancelado = true;
    };
  }, [items, detalhes]);

  const carregandoDetalhes = items.some((i) => !i.nome && !detalhes[i.produtoId]);

  const itensFormatados = items.map((item) => {
    const prod = detalhes[item.produtoId];
    const nome = item.nome ?? prod?.nome ?? `Produto #${item.produtoId}`;
    const preco = item.preco ?? prod?.preco ?? 0;
    const subtotal = preco * item.quantidade;
    return { ...item, nome, preco, subtotal };
  });

  const total = itensFormatados.reduce((acc, i) => acc + i.subtotal, 0);

  // O checkout real (endereço, pagamento e revisão) acontece em /checkout.
  const executarCheckout = React.useCallback(() => {
    if (items.length === 0) {
      toast.warning("Seu carrinho está vazio.");
      return;
    }
    router.push("/checkout");
  }, [items.length, router]);

  const { requireAuth, isRoleBlocked } = useRequireAuth(executarCheckout);

  const handleRemover = async (idProduto: number) => {
    try {
      setRemovendoId(idProduto);
      await removeItem(idProduto);
      toast.success("Item removido do carrinho.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRemovendoId(null);
    }
  };

  const botaoFinalizar = (
    <Button
      size="lg"
      className="w-full sm:w-auto"
      disabled={items.length === 0 || isRoleBlocked}
      onClick={requireAuth}
    >
      Finalizar Compra
    </Button>
  );

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Carrinho de Compras</h1>
            <p className="text-sm text-muted-foreground">
              Revise seus itens antes de prosseguir com a compra.
            </p>
          </div>
          <Link href="/produtos" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ArrowLeftIcon className="size-4" /> Continuar comprando
          </Link>
        </div>

        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="size-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Seu carrinho está vazio</CardTitle>
            <CardDescription className="mt-1.5">
              Explore nossa vitrine de produtos e adicione seus itens favoritos.
            </CardDescription>
            <div className="mt-6">
              <Link href="/produtos" className={buttonVariants({ size: "default" })}>
                Explorar produtos
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Itens ({items.reduce((acc, i) => acc + i.quantidade, 0)})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-12 text-center">
                          <span className="sr-only">Ações</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensFormatados.map((item) => (
                        <TableRow key={item.produtoId}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/produtos/${item.produtoId}`}
                              className="hover:underline"
                            >
                              {item.nome}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatBRL(item.preco)}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantidade}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatBRL(item.subtotal)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={removendoId === item.produtoId}
                              aria-label={`Remover ${item.nome}`}
                              onClick={() => handleRemover(item.produtoId)}
                            >
                              {removendoId === item.produtoId ? (
                                <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                              ) : (
                                <Trash2Icon className="size-4 text-destructive" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {carregandoDetalhes && (
                    <p className="p-4 text-xs text-muted-foreground">
                      Carregando detalhes dos produtos...
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatBRL(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-emerald-600 font-medium">Grátis</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatBRL(total)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  {isRoleBlocked ? (
                    <Tooltip>
                      <TooltipTrigger render={<div className="w-full cursor-not-allowed" />}>
                        {botaoFinalizar}
                      </TooltipTrigger>
                      <TooltipContent>{BLOCKED_MESSAGE}</TooltipContent>
                    </Tooltip>
                  ) : (
                    botaoFinalizar
                  )}
                  <p className="text-center text-xs text-muted-foreground">
                    Ao finalizar, seu pedido será processado imediatamente.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
