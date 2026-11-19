"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { buttonVariants } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { CompraResponse } from "@/services/checkoutService";
import { compraService } from "@/services/compraService";

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
  const codigo = useSearchParams().get("pedido");
  // Guarda o resultado junto do código consultado: sem setState síncrono no effect.
  const [resultado, setResultado] = React.useState<{
    codigo: string;
    compra?: CompraResponse;
    erro?: string;
  } | null>(null);

  React.useEffect(() => {
    if (!codigo) return;
    let ativo = true;
    compraService
      .buscarPorCodigo(codigo)
      .then((compra) => ativo && setResultado({ codigo, compra }))
      .catch((e) => ativo && setResultado({ codigo, erro: getErrorMessage(e) }));
    return () => {
      ativo = false;
    };
  }, [codigo]);

  const atual = resultado && resultado.codigo === codigo ? resultado : null;
  const compra = atual?.compra;
  const pix = compra?.metodoPagamento === "PIX";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 p-6 text-center">
      <CheckCircle2Icon className="size-16 text-green-600" aria-hidden />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Obrigado pela sua compra!</h1>
        {!codigo && <p className="text-muted-foreground">Compra não informada.</p>}
        {codigo && !atual && <p className="text-muted-foreground">Carregando dados da compra...</p>}
        {atual?.erro && <p className="text-sm text-destructive">{atual.erro}</p>}
        {compra && (
          <p className="text-muted-foreground">
            Compra <span className="font-mono font-medium text-foreground">{compra.codigo}</span> realizada com
            sucesso. Total: <span className="font-medium text-foreground">{formatBRL(compra.valorTotal)}</span>.
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

      <Link
        // Uma compra gera um pedido por loja: com um só, já abre o rastreio dele.
        href={compra?.pedidos?.length === 1 ? `/conta/pedidos/${compra.pedidos[0].id}` : "/conta/pedidos"}
        className={cn(buttonVariants())}
      >
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
