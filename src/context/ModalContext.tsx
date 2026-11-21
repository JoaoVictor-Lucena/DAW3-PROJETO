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
  openRegisterModal: (onSuccess?: LoginSuccessHandler) => void;
}

type Mode = "login" | "register";

const MODOS: Mode[] = ["login", "register"];

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

  const openRegisterModal = React.useCallback((handler?: LoginSuccessHandler) => {
    onSuccess.current = handler;
    setMode("register");
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

  /** Padrão WAI-ARIA de abas: ←/→ alternam, Home/End vão às pontas, e o foco acompanha. */
  const handleTabsKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const atual = MODOS.indexOf(mode);
      let proximo = atual;
      if (e.key === "ArrowRight") proximo = (atual + 1) % MODOS.length;
      else if (e.key === "ArrowLeft") proximo = (atual - 1 + MODOS.length) % MODOS.length;
      else if (e.key === "Home") proximo = 0;
      else if (e.key === "End") proximo = MODOS.length - 1;
      else return;
      e.preventDefault();
      setMode(MODOS[proximo]);
      document.getElementById(`modal-aba-${MODOS[proximo]}`)?.focus();
    },
    [mode],
  );

  const value = React.useMemo(() => ({ openLoginModal, openRegisterModal }), [openLoginModal, openRegisterModal]);

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
          <div
            className="grid grid-cols-2 gap-1.5 rounded-lg bg-muted p-1"
            role="tablist"
            aria-label="Entrar ou criar conta"
            onKeyDown={handleTabsKeyDown}
          >
            {MODOS.map((m) => (
              <Button
                key={m}
                id={`modal-aba-${m}`}
                type="button"
                role="tab"
                size="sm"
                aria-selected={mode === m}
                aria-controls="modal-aba-painel"
                tabIndex={mode === m ? 0 : -1}
                variant={mode === m ? "default" : "ghost"}
                onClick={() => setMode(m)}
              >
                {m === "login" ? "Entrar" : "Criar conta (cliente)"}
              </Button>
            ))}
          </div>
          <div id="modal-aba-painel" role="tabpanel" aria-labelledby={`modal-aba-${mode}`}>
            {mode === "login" ? (
              <LoginForm onSuccess={handleLogged} />
            ) : (
              <RegisterForm apenasCliente onRegistered={() => setMode("login")} onSuccess={handleLogged} />
            )}
          </div>
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
