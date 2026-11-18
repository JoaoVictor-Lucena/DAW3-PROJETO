"use client";

import * as React from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AuthUser } from "@/context/AuthContext";

type LoginSuccessHandler = (user: AuthUser) => void;

interface ModalContextValue {
  openLoginModal: (onSuccess?: LoginSuccessHandler) => void;
}

type Mode = "login" | "register";

const ModalContext = React.createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("login");
  const onSuccess = React.useRef<LoginSuccessHandler | undefined>(undefined);

  const openLoginModal = React.useCallback((handler?: LoginSuccessHandler) => {
    onSuccess.current = handler;
    setMode("login");
    setOpen(true);
  }, []);

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (!next) onSuccess.current = undefined;
  }, []);

  const handleLogged = React.useCallback((user: AuthUser) => {
    const handler = onSuccess.current;
    onSuccess.current = undefined;
    setOpen(false);
    handler?.(user);
  }, []);

  const value = React.useMemo(() => ({ openLoginModal }), [openLoginModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entre para continuar</DialogTitle>
            <DialogDescription>
              Faça login ou crie uma conta. Sua ação será concluída em seguida.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-muted p-1" role="tablist">
            {(["login", "register"] as const).map((m) => (
              <Button
                key={m}
                type="button"
                role="tab"
                size="sm"
                aria-selected={mode === m}
                variant={mode === m ? "default" : "ghost"}
                onClick={() => setMode(m)}
              >
                {m === "login" ? "Entrar" : "Criar conta (cliente)"}
              </Button>
            ))}
          </div>
          {mode === "login" ? (
            <LoginForm onSuccess={handleLogged} />
          ) : (
            <RegisterForm apenasCliente onRegistered={() => setMode("login")} onSuccess={handleLogged} />
          )}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = React.useContext(ModalContext);
  if (!ctx) throw new Error("useModal deve ser usado dentro de <ModalProvider>");
  return ctx;
}
