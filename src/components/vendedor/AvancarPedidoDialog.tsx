"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACAO_DA_ETAPA, ETAPAS_COM_RASTREIO } from "@/components/vendedor/acoesPedido";
import { ETAPA_PEDIDO_LABEL } from "@/lib/admin-labels";
import { ApiError, getErrorMessage } from "@/services/api";
import { painelVendedorService } from "@/services/painelVendedorService";
import type { EtapaPedido, Pedido } from "@/types";

const EXPLICACAO: Partial<Record<EtapaPedido, string>> = {
  PAGAMENTO_APROVADO: "Confirme que o pagamento foi recebido para começar a separar o pedido.",
  EMBALADO:
    "O pedido foi separado e embalado. Se já souber, informe a transportadora e o código de rastreio.",
  EM_TRANSITO: "O pedido foi entregue à transportadora. O cliente passa a ver o código de rastreio.",
  SAIU_PARA_ENTREGA: "A transportadora saiu para entregar o pedido ao cliente.",
  ENTREGUE: "O cliente recebeu o pedido. Depois disso ele pode avaliar os produtos ou pedir devolução.",
};

const MAX_RASTREIO = 50;

type Erros = Partial<Record<"transportadora" | "codigoRastreamento", string>>;

/** Leva o pedido para a próxima etapa; no envio pede transportadora e código de rastreio. */
export function AvancarPedidoDialog({
  pedido,
  onFechar,
  onAvancado,
}: {
  pedido: Pedido | null;
  onFechar: () => void;
  onAvancado: () => void;
}) {
  return (
    <Dialog open={pedido !== null} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent>
        {pedido?.proximaEtapa && (
          <Formulario
            key={`${pedido.id}-${pedido.proximaEtapa}`}
            pedido={pedido}
            etapa={pedido.proximaEtapa}
            onFechar={onFechar}
            onAvancado={onAvancado}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({
  pedido,
  etapa,
  onFechar,
  onAvancado,
}: {
  pedido: Pedido;
  etapa: EtapaPedido;
  onFechar: () => void;
  onAvancado: () => void;
}) {
  const comRastreio = ETAPAS_COM_RASTREIO.includes(etapa);
  const obrigatorio = etapa === "EM_TRANSITO";
  const [transportadora, setTransportadora] = React.useState(pedido.transportadora ?? "");
  const [codigo, setCodigo] = React.useState(pedido.codigoRastreamento ?? "");
  const [erros, setErros] = React.useState<Erros>({});
  const [enviando, setEnviando] = React.useState(false);

  async function avancar(e: React.FormEvent) {
    e.preventDefault();
    const t = transportadora.trim();
    const c = codigo.trim();
    if (obrigatorio) {
      const novos: Erros = {};
      if (!t) novos.transportadora = "Informe a transportadora.";
      if (!c) novos.codigoRastreamento = "Informe o código de rastreio.";
      setErros(novos);
      if (Object.keys(novos).length) return;
    }

    setEnviando(true);
    try {
      await painelVendedorService.avancar(
        pedido.id,
        etapa,
        comRastreio ? { transportadora: t || undefined, codigoRastreamento: c || undefined } : undefined,
      );
      toast.success(`Pedido #${pedido.id}: ${ETAPA_PEDIDO_LABEL[etapa].toLowerCase()}.`);
      onAvancado();
      onFechar();
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.erros).length) setErros(error.erros as Erros);
      else toast.error(getErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  }

  const campo = (
    id: keyof Erros,
    rotulo: string,
    valor: string,
    mudar: (v: string) => void,
    placeholder: string,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={`avancar-${id}`}>
        {rotulo}
        {!obrigatorio && <span className="font-normal text-muted-foreground"> (opcional)</span>}
      </Label>
      <Input
        id={`avancar-${id}`}
        value={valor}
        maxLength={MAX_RASTREIO}
        placeholder={placeholder}
        aria-invalid={!!erros[id]}
        aria-describedby={erros[id] ? `avancar-${id}-erro` : undefined}
        onChange={(e) => {
          mudar(e.target.value);
          setErros((atual) => ({ ...atual, [id]: undefined }));
        }}
      />
      {erros[id] && (
        <p id={`avancar-${id}-erro`} className="text-xs text-destructive">
          {erros[id]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={avancar} className="space-y-4" noValidate>
      <DialogHeader>
        <DialogTitle>
          {ACAO_DA_ETAPA[etapa] ?? ETAPA_PEDIDO_LABEL[etapa]} · pedido #{pedido.id}
        </DialogTitle>
        <DialogDescription>{EXPLICACAO[etapa]}</DialogDescription>
      </DialogHeader>

      {comRastreio && (
        <div className="grid gap-4 sm:grid-cols-2">
          {campo("transportadora", "Transportadora", transportadora, setTransportadora, "Ex.: Correios")}
          {campo("codigoRastreamento", "Código de rastreio", codigo, setCodigo, "Ex.: BR123456789BR")}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" disabled={enviando} onClick={onFechar}>
          Voltar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando && <Loader2Icon className="animate-spin" />}
          {ACAO_DA_ETAPA[etapa] ?? "Avançar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
