"use client";

import { EstadoErro } from "@/components/layout/EstadoErro";

/** Erros dentro desta área (o cabeçalho continua na tela). */
export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <EstadoErro {...props} />;
}
