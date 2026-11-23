"use client";

import { EstadoErro } from "@/components/layout/EstadoErro";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <EstadoErro {...props} />;
}
