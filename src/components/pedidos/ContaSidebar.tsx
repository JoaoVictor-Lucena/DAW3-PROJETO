"use client";

import {
  HeartIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  PackageIcon,
  RotateCcwIcon,
  StarIcon,
  UserIcon,
} from "lucide-react";

import { PainelSidebar } from "@/components/layout/PainelSidebar";

// Os ícones são funções (componentes), que não podem atravessar a fronteira Server → Client.
// Por isso o array fica aqui, dentro de um Client Component.
const ITENS = [
  { href: "/conta", label: "Visão geral", Icon: LayoutDashboardIcon },
  { href: "/conta/perfil", label: "Perfil", Icon: UserIcon },
  { href: "/conta/enderecos", label: "Endereços", Icon: MapPinIcon },
  { href: "/conta/avaliacoes", label: "Avaliações", Icon: StarIcon },
  { href: "/conta/devolucoes", label: "Devoluções", Icon: RotateCcwIcon },
  { href: "/conta/pedidos", label: "Meus pedidos", Icon: PackageIcon },
  { href: "/conta/favoritos", label: "Lista de desejos", Icon: HeartIcon },
] as const;

/** Menu lateral da área do cliente. */
export function ContaSidebar() {
  return <PainelSidebar itens={ITENS} ariaLabel="Minha conta" />;
}
