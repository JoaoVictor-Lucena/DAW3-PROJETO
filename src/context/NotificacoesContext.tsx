"use client";

import * as React from "react";

import { useAuth } from "@/context/AuthContext";
import { notificacaoService } from "@/services/notificacaoService";

/** Intervalo do polling do contador do sino. */
const INTERVALO_MS = 30_000;

interface NotificacoesContextValue {
  naoLidas: number;
  /** Atualiza o contador agora (ex.: depois de marcar como lida). */
  atualizar: () => void;
  /** Muda a cada atualização, para listas recarregarem junto com o contador. */
  versao: number;
}

const NotificacoesContext = React.createContext<NotificacoesContextValue | null>(null);

/**
 * Mantém o número de notificações não lidas do usuário logado: busca ao entrar, a cada 30 s
 * e quando a aba volta a ficar visível.
 */
export function NotificacoesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const chave = user ? `${user.role}:${user.id ?? user.email}` : null;
  const [estado, setEstado] = React.useState<{ chave: string; naoLidas: number } | null>(null);
  const [versao, setVersao] = React.useState(0);
  const ultimaContagem = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (chave === null) return;
    let cancelado = false;
    ultimaContagem.current = null;

    const buscar = () => {
      if (document.visibilityState === "hidden") return;
      notificacaoService
        .contarNaoLidas()
        .then((naoLidas) => {
          if (cancelado) return;
          // Chegou notificação nova (ou alguma foi lida em outra aba): avisa as listas abertas.
          if (ultimaContagem.current !== null && ultimaContagem.current !== naoLidas) {
            setVersao((v) => v + 1);
          }
          ultimaContagem.current = naoLidas;
          setEstado({ chave, naoLidas });
        })
        .catch(() => {});
    };

    buscar();
    const intervalo = window.setInterval(buscar, INTERVALO_MS);
    document.addEventListener("visibilitychange", buscar);
    window.addEventListener(ATUALIZAR_EVENT, buscar);
    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", buscar);
      window.removeEventListener(ATUALIZAR_EVENT, buscar);
    };
  }, [chave]);

  const atualizar = React.useCallback(() => {
    window.dispatchEvent(new Event(ATUALIZAR_EVENT));
    setVersao((v) => v + 1);
  }, []);

  const naoLidas = estado && estado.chave === chave ? estado.naoLidas : 0;
  const value = React.useMemo(() => ({ naoLidas, atualizar, versao }), [naoLidas, atualizar, versao]);

  return <NotificacoesContext.Provider value={value}>{children}</NotificacoesContext.Provider>;
}

const ATUALIZAR_EVENT = "marketplace:notificacoes-atualizar";

export function useNotificacoes(): NotificacoesContextValue {
  const ctx = React.useContext(NotificacoesContext);
  if (!ctx) throw new Error("useNotificacoes deve ser usado dentro de <NotificacoesProvider>");
  return ctx;
}
