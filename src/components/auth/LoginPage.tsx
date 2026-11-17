"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, StoreIcon } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { destinoAposLogin, redirectSeguro } from "@/lib/auth-routes";

type Mode = "login" | "register";

export function LoginPage() {
  const [mode, setMode] = React.useState<Mode>("login");
  const { user } = useAuth();
  const router = useRouter();
  const redirect = redirectSeguro(useSearchParams().get("redirect"));

  // Já logado (ou acabou de logar): volta para a rota pedida ou para o painel do perfil.
  React.useEffect(() => {
    if (user) router.replace(redirect ?? destinoAposLogin(user.role));
  }, [user, redirect, router]);

  if (user) return null;

  return (
    <main className="relative flex flex-1 items-center justify-center bg-muted/20 px-4 py-12">
      <div className="absolute left-4 top-4">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeftIcon /> Voltar para a loja
        </Link>
      </div>
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <StoreIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold">Marketplace</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Acesse sua conta para comprar ou gerenciar sua loja."
                : "Crie rapidamente uma conta de Cliente ou Vendedor."}
            </CardDescription>
          </div>

          <div
            className="grid grid-cols-2 gap-1.5 rounded-lg bg-muted p-1"
            role="tablist"
          >
            <Button
              type="button"
              role="tab"
              size="sm"
              aria-selected={mode === "login"}
              variant={mode === "login" ? "default" : "ghost"}
              onClick={() => setMode("login")}
            >
              Entrar
            </Button>
            <Button
              type="button"
              role="tab"
              size="sm"
              aria-selected={mode === "register"}
              variant={mode === "register" ? "default" : "ghost"}
              onClick={() => setMode("register")}
            >
              Criar conta
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {mode === "login" ? (
            <LoginForm />
          ) : (
            <RegisterForm onRegistered={() => setMode("login")} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
