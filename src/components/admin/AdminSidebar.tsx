"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

import { cn } from "@/lib/utils";

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

/** Menu lateral do painel do admin (vira uma faixa rolável no celular). */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Painel do administrador" className="md:w-52 md:shrink-0">
      <ul className="flex gap-1 overflow-x-auto pb-2 md:sticky md:top-20 md:flex-col md:overflow-visible md:pb-0">
        {ITENS.map(({ href, label, Icon }) => {
          const ativo = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  ativo
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
