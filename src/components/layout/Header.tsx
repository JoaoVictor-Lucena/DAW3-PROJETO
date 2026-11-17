"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DatabaseIcon,
  LayoutDashboardIcon,
  Loader2Icon,
  LogInIcon,
  LogOutIcon,
  StoreIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { loginComRedirect, painelDoPerfil } from "@/lib/auth-routes";
import { getErrorMessage } from "@/services/api";
import { notifySeedUpdated, seedService } from "@/services/seedService";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [seeding, setSeeding] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await seedService.popularInfinito();
      if (res.modo === "inicial") {
        toast.success("Banco populado com a carga inicial de teste!");
      } else {
        toast.success(
          `+${res.criados ?? 10} novos produtos adicionados ao catálogo!`,
        );
      }
      notifySeedUpdated();
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSeeding(false);
    }
  }

  async function handleClear() {
    if (clearing) return;
    setClearing(true);
    try {
      await seedService.limpar();
      toast.success("Banco de dados limpo com sucesso.");
      setClearing(false);
      setConfirmClear(false);
      notifySeedUpdated();
      router.refresh();
    } catch (error) {
      setClearing(false);
      toast.error(getErrorMessage(error));
    }
  }

  const busy = seeding || clearing;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <nav className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
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
          {user ? (
            <>
              <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">
                {user.nome ?? user.email}
              </span>
              <Badge variant="secondary">{user.role}</Badge>
              <Link
                href={painelDoPerfil(user.role)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <LayoutDashboardIcon className="size-4" />
                <span className="hidden sm:inline">
                  {user.role === "CLIENTE" ? "Minha conta" : "Meu painel"}
                </span>
              </Link>
            </>
          ) : null}

          {user?.role === "ADMIN" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeed}
                disabled={busy}
              >
                {seeding ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <DatabaseIcon className="size-4" />
                )}
                <span className="hidden sm:inline">Popular Banco (Seed)</span>
                <span className="sm:hidden">Seed</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmClear(true)}
                disabled={busy}
              >
                {clearing ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <Trash2Icon className="size-4" />
                )}
                <span className="hidden sm:inline">Limpar Banco</span>
                <span className="sm:hidden">Limpar</span>
              </Button>
            </>
          )}

          <ThemeToggle />

          {user ? (
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOutIcon className="size-4" />
              Sair
            </Button>
          ) : (
            <Link href={loginComRedirect(pathname)} className={buttonVariants({ size: "sm" })}>
              <LogInIcon className="size-4" />
              Entrar
            </Link>
          )}
        </div>
      </div>

      <AlertDialog
        open={confirmClear}
        onOpenChange={(open) => {
          if (!clearing) setConfirmClear(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlertIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Limpar banco de dados?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá os produtos, categorias, pedidos e demais dados de
              teste cadastrados no banco (mantendo apenas o Admin padrão). Deseja
              continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={clearing}
              onClick={(e) => {
                e.preventDefault();
                void handleClear();
              }}
            >
              {clearing && <Loader2Icon className="animate-spin" />}
              Limpar Banco
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
