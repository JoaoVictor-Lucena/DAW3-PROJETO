"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShoppingCartIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getErrorMessage } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { BLOCKED_MESSAGE, useBloqueioPorPerfil, useRequireAuth } from "@/hooks/useRequireAuth";

interface PurchaseButtonProps {
  produtoId: number;
  quantidade?: number;
  disabled?: boolean;
}

/** Botão de compra: desabilitado (com explicação) para vendedor e admin. */
function BotaoCompra({
  onClick,
  disabled,
  variant,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "outline";
  children: React.ReactNode;
}) {
  const bloqueado = useBloqueioPorPerfil();
  const button = (
    <Button variant={variant} onClick={onClick} disabled={disabled || bloqueado}>
      {children}
    </Button>
  );

  if (!bloqueado) return button;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-block cursor-not-allowed" />}>
        {button}
      </TooltipTrigger>
      <TooltipContent>{BLOCKED_MESSAGE}</TooltipContent>
    </Tooltip>
  );
}

/** O visitante também adiciona: o item fica no carrinho do navegador até ele entrar. */
export function AddToCartButton({ produtoId, quantidade = 1, disabled }: PurchaseButtonProps) {
  const { addItem } = useCart();
  const adicionar = React.useCallback(async () => {
    try {
      await addItem(produtoId, quantidade);
      toast.success("Item adicionado!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [addItem, produtoId, quantidade]);

  return (
    <BotaoCompra onClick={() => void adicionar()} disabled={disabled} variant="outline">
      <ShoppingCartIcon /> Adicionar ao carrinho
    </BotaoCompra>
  );
}

/** Adiciona ao carrinho na hora; o login só é pedido para seguir ao checkout. */
export function BuyNowButton({ produtoId, quantidade = 1, disabled }: PurchaseButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const irParaCheckout = React.useCallback(() => router.push("/checkout"), [router]);
  const { requireAuth } = useRequireAuth(irParaCheckout);

  async function comprar() {
    try {
      await addItem(produtoId, quantidade);
      requireAuth();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <BotaoCompra onClick={() => void comprar()} disabled={disabled}>
      Comprar agora
    </BotaoCompra>
  );
}
