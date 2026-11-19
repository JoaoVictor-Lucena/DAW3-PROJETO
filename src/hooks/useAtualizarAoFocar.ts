"use client";

import * as React from "react";

/**
 * Chama `atualizar` quando o usuário volta para a aba e, enquanto ela estiver visível,
 * a cada `intervaloMs` (polling). Assim a mudança de status feita pelo vendedor aparece sozinha.
 */
export function useAtualizarAoFocar(atualizar: () => void, intervaloMs = 30_000) {
  const executar = React.useEffectEvent(atualizar);

  React.useEffect(() => {
    let ultima = Date.now();
    const talvezAtualizar = () => {
      if (document.visibilityState !== "visible") return;
      // Evita duas atualizações seguidas quando "focus" e "visibilitychange" disparam juntos.
      if (Date.now() - ultima < 2_000) return;
      ultima = Date.now();
      executar();
    };

    const timer = window.setInterval(talvezAtualizar, intervaloMs);
    window.addEventListener("focus", talvezAtualizar);
    document.addEventListener("visibilitychange", talvezAtualizar);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", talvezAtualizar);
      document.removeEventListener("visibilitychange", talvezAtualizar);
    };
  }, [intervaloMs]);
}
