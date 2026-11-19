"use client";

import {
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  PackageIcon,
  ReceiptTextIcon,
  StoreIcon,
  Undo2Icon,
} from "lucide-react";

import { PainelSidebar } from "@/components/layout/PainelSidebar";

const ITENS = [
  { href: "/vendedor", label: "Visão geral", Icon: LayoutDashboardIcon },
  { href: "/vendedor/produtos", label: "Meus produtos", Icon: PackageIcon },
  { href: "/vendedor/pedidos", label: "Pedidos recebidos", Icon: ReceiptTextIcon },
  { href: "/vendedor/devolucoes", label: "Devoluções", Icon: Undo2Icon },
  { href: "/vendedor/avaliacoes", label: "Avaliações", Icon: MessageSquareTextIcon },
  { href: "/vendedor/loja", label: "Perfil da loja", Icon: StoreIcon },
] as const;

/** Menu lateral do painel do vendedor. */
export function VendedorSidebar() {
  return <PainelSidebar itens={ITENS} ariaLabel="Painel do vendedor" />;
}
