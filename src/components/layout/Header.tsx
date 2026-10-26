"use client";

import * as React from "react";
import Link from "next/link";
import { DatabaseIcon, LogOutIcon, Loader2Icon, StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/services/api";
import { seedService } from "@/services/seedService";

export function Header() {
  const { user, logout } = useAuth();
  const [seeding, setSeeding] = React.useState(false);

  if (!user) return null;

  async function handleSeed() {
    setSeeding(true);
    try {
      await seedService.popular();
      toast.success("Banco populado com dados de teste.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSeeding(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <nav className="flex items-center gap-4">
          <Link href="/produtos" className="flex items-center gap-2 font-semibold">
            <StoreIcon className="size-5" />
            Marketplace
          </Link>
          <Link
            href="/produtos"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Produtos
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">
            {user.email}
          </span>
          <Badge variant="secondary">{user.role}</Badge>

          {user.role === "ADMIN" && (
            <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
              {seeding ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <DatabaseIcon className="size-4" />
              )}
              <span className="hidden sm:inline">Popular Banco (Seed)</span>
              <span className="sm:hidden">Seed</span>
            </Button>
          )}

          <ThemeToggle />

          <Button variant="outline" size="sm" onClick={logout}>
            <LogOutIcon className="size-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
