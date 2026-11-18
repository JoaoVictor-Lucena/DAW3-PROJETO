"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** QR Code fictício (placeholder): padrão de módulos determinístico, não escaneável. */
function QrCodePlaceholder() {
  const n = 21;
  const celulas = Array.from({ length: n * n }, (_, i) => {
    const x = i % n;
    const y = Math.floor(i / n);
    const marcador = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    if (marcador) {
      const lx = x >= n - 7 ? x - (n - 7) : x;
      const ly = y >= n - 7 ? y - (n - 7) : y;
      return lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
    }
    return (x * 7 + y * 13 + x * y) % 3 === 0;
  });

  return (
    <div
      role="img"
      aria-label="QR Code de exemplo para pagamento PIX"
      className="grid size-44 rounded-lg border bg-white p-2"
      style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
    >
      {celulas.map((preenchida, i) => (
        <span key={i} className={preenchida ? "bg-black" : "bg-white"} />
      ))}
    </div>
  );
}

function Conteudo() {
  const params = useSearchParams();
  const pedido = params.get("pedido");
  const pix = params.get("metodo") === "PIX";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 p-6 text-center">
      <CheckCircle2Icon className="size-16 text-green-600" aria-hidden />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Obrigado pela sua compra!</h1>
        {pedido && (
          <p className="text-muted-foreground">
            Pedido <span className="font-mono font-medium text-foreground">#{pedido}</span> realizado com sucesso.
          </p>
        )}
      </div>

      {pix && (
        <div className="flex flex-col items-center gap-3">
          <QrCodePlaceholder />
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code para pagar com PIX (exemplo ilustrativo).
          </p>
        </div>
      )}

      <Link href="/meus-pedidos" className={cn(buttonVariants())}>
        Meus pedidos
      </Link>
    </main>
  );
}

export default function SucessoPage() {
  return (
    <RoleGuard allow={["CLIENTE"]}>
      <Header />
      <React.Suspense fallback={null}>
        <Conteudo />
      </React.Suspense>
    </RoleGuard>
  );
}
