"use client";

import * as React from "react";
import { toast } from "sonner";

import { getErrorMessage } from "@/services/api";

interface Estado<T> {
  chave: string;
  dados?: T;
  erro?: string;
}

/**
 * Carrega dados sempre que `chave` muda (ex.: filtros + página serializados).
 * Mantém os dados anteriores enquanto recarrega, para a tela não "piscar".
 */
export function useCarregar<T>(chave: string, carregar: () => Promise<T>) {
  const [estado, setEstado] = React.useState<Estado<T> | null>(null);
  const [versao, setVersao] = React.useState(0);
  const buscar = React.useEffectEvent(carregar);
  const chaveAtual = `${chave}#${versao}`;

  React.useEffect(() => {
    let cancelado = false;
    buscar()
      .then((dados) => !cancelado && setEstado({ chave: chaveAtual, dados }))
      .catch((e) => {
        if (cancelado) return;
        const erro = getErrorMessage(e);
        toast.error(erro);
        setEstado({ chave: chaveAtual, erro });
      });
    return () => {
      cancelado = true;
    };
  }, [chaveAtual]);

  const recarregar = React.useCallback(() => setVersao((v) => v + 1), []);
  const carregando = estado?.chave !== chaveAtual;

  return {
    dados: estado?.dados,
    erro: carregando ? undefined : estado?.erro,
    carregando,
    recarregar,
  };
}
