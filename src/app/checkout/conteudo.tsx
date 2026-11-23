"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PassoEndereco } from "@/components/checkout/PassoEndereco";
import { PassoPagamento } from "@/components/checkout/PassoPagamento";
import { PassoRevisao } from "@/components/checkout/PassoRevisao";
import { Stepper } from "@/components/checkout/Stepper";
import { Header } from "@/components/layout/Header";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { useCart } from "@/context/CartContext";
import { ApiError, getErrorMessage } from "@/services/api";
import { checkoutService } from "@/services/checkoutService";
import type { Cupom, Endereco, MetodoPagamento } from "@/types";

const PASSOS = ["Endereço", "Pagamento", "Revisão"];

function CheckoutConteudo() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [passo, setPasso] = React.useState(0);
  const [endereco, setEndereco] = React.useState<Endereco | null>(null);
  const [metodo, setMetodo] = React.useState<MetodoPagamento | null>(null);
  const [cupom, setCupom] = React.useState<Cupom | null>(null);
  const [erroCupom, setErroCupom] = React.useState<{ codigo: string; mensagem: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const enviando = React.useRef(false);

  async function finalizar() {
    if (enviando.current || !endereco?.id || !metodo) return;
    enviando.current = true;
    setIsLoading(true);
    try {
      const compra = await checkoutService.checkout({
        idEndereco: endereco.id,
        metodoPagamento: metodo,
        codigoCupom: cupom?.codigo,
      });
      clearCart();
      router.push(`/checkout/sucesso?pedido=${encodeURIComponent(compra.codigo)}`);
    } catch (e) {
      if (cupom && e instanceof ApiError && e.status === 422 && /cupom/i.test(e.message)) {
        setErroCupom({ codigo: cupom.codigo, mensagem: e.message });
        setCupom(null);
        setPasso(1);
      } else {
        toast.error(getErrorMessage(e));
      }
      enviando.current = false;
      setIsLoading(false);
    }
  }

  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-3xl space-y-8 p-4 outline-none sm:p-6">
      <h1 className="text-2xl font-semibold">Finalizar compra</h1>
      <Stepper passos={PASSOS} atual={passo} />

      {passo === 0 && (
        <PassoEndereco
          selecionado={endereco?.id ?? null}
          onSelecionar={setEndereco}
          onAvancar={() => setPasso(1)}
        />
      )}

      {passo === 1 && (
        <PassoPagamento
          metodo={metodo}
          onMetodo={setMetodo}
          cupom={cupom}
          onCupom={setCupom}
          codigoInicial={erroCupom?.codigo}
          erroInicial={erroCupom?.mensagem}
          onVoltar={() => setPasso(0)}
          onAvancar={() => {
            setErroCupom(null);
            setPasso(2);
          }}
        />
      )}

      {passo === 2 && endereco && metodo && (
        <PassoRevisao
          endereco={endereco}
          metodo={metodo}
          cupom={cupom}
          isLoading={isLoading}
          onVoltar={() => setPasso(1)}
          onFinalizar={finalizar}
        />
      )}
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <RoleGuard allow={["CLIENTE"]}>
      <Header />
      <CheckoutConteudo />
    </RoleGuard>
  );
}
