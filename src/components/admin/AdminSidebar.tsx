"use client";

import {
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  PackageIcon,
  ReceiptTextIcon,
  TagsIcon,
  TicketPercentIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";

import { PainelSidebar } from "@/components/layout/PainelSidebar";

const ITENS = [
  { href: "/admin", label: "Visão geral", Icon: LayoutDashboardIcon },
  { href: "/admin/usuarios", label: "Usuários", Icon: UsersIcon },
  { href: "/admin/categorias", label: "Categorias", Icon: TagsIcon },
  { href: "/admin/cupons", label: "Cupons", Icon: TicketPercentIcon },
  { href: "/admin/produtos", label: "Produtos", Icon: PackageIcon },
  { href: "/admin/pedidos", label: "Pedidos", Icon: ReceiptTextIcon },
  { href: "/admin/avaliacoes", label: "Avaliações", Icon: MessageSquareTextIcon },
  { href: "/admin/ferramentas", label: "Ferramentas", Icon: WrenchIcon },
] as const;

/** Menu lateral do painel do administrador. */
export function AdminSidebar() {
  return <PainelSidebar itens={ITENS} ariaLabel="Painel do administrador" />;
}
