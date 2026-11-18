"use client";

import { HeartIcon, LayoutDashboardIcon, PackageIcon } from "lucide-react";

import { PainelSidebar } from "@/components/layout/PainelSidebar";

const ITENS = [
  { href: "/conta", label: "Visão geral", Icon: LayoutDashboardIcon },
  { href: "/conta/pedidos", label: "Meus pedidos", Icon: PackageIcon },
  { href: "/conta/favoritos", label: "Lista de desejos", Icon: HeartIcon },
] as const;

/** Menu lateral da área do cliente. */
export function ContaSidebar() {
  return <PainelSidebar itens={ITENS} ariaLabel="Minha conta" />;
}
