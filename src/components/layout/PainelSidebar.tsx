"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ItemSidebar {
  href: string;
  label: string;
  Icon: LucideIcon;
}

/**
 * Menu lateral dos painéis (vira uma faixa rolável no celular).
 * O primeiro item é a raiz do painel: só fica ativo na rota exata.
 */
export function PainelSidebar({ itens, ariaLabel }: { itens: readonly ItemSidebar[]; ariaLabel: string }) {
  const pathname = usePathname();
  const raiz = itens[0]?.href;

  return (
    <nav aria-label={ariaLabel} className="md:w-52 md:shrink-0">
      <ul className="flex gap-1 overflow-x-auto pb-2 md:sticky md:top-20 md:flex-col md:overflow-visible md:pb-0">
        {itens.map(({ href, label, Icon }) => {
          const ativo = href === raiz ? pathname === href : pathname.startsWith(href);
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
