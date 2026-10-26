"use client";

import * as React from "react";

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
    <main className="relative flex flex-1 items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Marketplace</CardTitle>
          <CardDescription>
            {mode === "login" ? "Entre com sua conta." : "Crie uma conta rápida."}
          </CardDescription>
          <div className="mt-2 grid grid-cols-2 gap-2" role="tablist">
            <Button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => setMode("login")}
            >
              Entrar
            </Button>
            <Button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              variant={mode === "register" ? "default" : "outline"}
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
