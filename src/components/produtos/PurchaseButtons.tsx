"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShoppingCartIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getErrorMessage } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { BLOCKED_MESSAGE, useRequireAuth } from "@/hooks/useRequireAuth";

interface PurchaseButtonProps {
  produtoId: number;
  quantidade?: number;
  disabled?: boolean;
}

function GuardedButton({
  acao,
  disabled,
  variant,
  children,
}: {
  acao: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "default" | "outline";
  children: React.ReactNode;
}) {
  const { requireAuth, isRoleBlocked } = useRequireAuth(acao);
  const button = (
    <Button variant={variant} onClick={requireAuth} disabled={disabled || isRoleBlocked}>
      {children}
    </Button>
  );

  if (!isRoleBlocked) return button;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-block cursor-not-allowed" />}>
        {button}
      </TooltipTrigger>
      <TooltipContent>{BLOCKED_MESSAGE}</TooltipContent>
    </Tooltip>
  );
}

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
    <GuardedButton acao={adicionar} disabled={disabled} variant="outline">
      <ShoppingCartIcon /> Adicionar ao carrinho
    </GuardedButton>
  );
}

export function BuyNowButton({ produtoId, quantidade = 1, disabled }: PurchaseButtonProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const comprar = React.useCallback(async () => {
    try {
      await addItem(produtoId, quantidade);
      router.push("/checkout");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [addItem, produtoId, quantidade, router]);

  return (
    <GuardedButton acao={comprar} disabled={disabled}>
      Comprar agora
    </GuardedButton>
  );
}
