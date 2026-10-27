"use client";

import * as React from "react";
import { StoreIcon } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Mode = "login" | "register";

export function LoginPage() {
  const [mode, setMode] = React.useState<Mode>("login");

  return (
    <main className="relative flex flex-1 items-center justify-center bg-muted/20 px-4 py-12">
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
                ? "Acesse sua conta para gerenciar o catálogo."
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
