"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import { cupomService } from "@/services/cupomService";
import type { Cupom, MetodoPagamento } from "@/types";

export const METODOS: { value: MetodoPagamento; label: string; descricao: string }[] = [
  { value: "PIX", label: "PIX", descricao: "Pagamento fica pendente até a confirmação." },
  { value: "CARTAO", label: "Cartão de Crédito", descricao: "Aprovação imediata (simulada)." },
  { value: "BOLETO", label: "Boleto", descricao: "Pagamento fica pendente até a compensação." },
];

export function PassoPagamento({
  metodo,
  onMetodo,
  cupom,
  onCupom,
  onVoltar,
  onAvancar,
}: {
  metodo: MetodoPagamento | null;
  onMetodo: (m: MetodoPagamento) => void;
  cupom: Cupom | null;
  onCupom: (c: Cupom | null) => void;
  onVoltar: () => void;
  onAvancar: () => void;
}) {
  const [codigo, setCodigo] = React.useState(cupom?.codigo ?? "");
  const [erro, setErro] = React.useState<string | null>(null);
  const [validando, setValidando] = React.useState(false);

  async function aplicar() {
    const valor = codigo.trim();
    if (!valor) {
      setErro("Informe o código do cupom.");
      return;
    }
    setValidando(true);
    setErro(null);
    try {
      const validado = await cupomService.validar(valor);
      onCupom(validado);
      toast.success(`Cupom ${validado.codigo} aplicado: ${formatBRL(validado.desconto)} de desconto.`);
    } catch (e) {
      onCupom(null);
      setErro(getErrorMessage(e));
    } finally {
      setValidando(false);
    }
  }

  function remover() {
    onCupom(null);
    setCodigo("");
    setErro(null);
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Forma de pagamento</h2>
        <div role="radiogroup" aria-label="Forma de pagamento" className="grid gap-3">
          {METODOS.map((m) => (
            <label
              key={m.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted",
                metodo === m.value && "border-primary ring-1 ring-primary",
              )}
            >
              <input
                type="radio"
                name="metodoPagamento"
                value={m.value}
                checked={metodo === m.value}
                onChange={() => onMetodo(m.value)}
                className="mt-1 accent-primary"
              />
              <span>
                <span className="block font-medium">{m.label}</span>
                <span className="text-muted-foreground">{m.descricao}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cupom-codigo">Cupom de desconto (opcional)</Label>
        <div className="flex gap-2">
          <Input
            id="cupom-codigo"
            placeholder="DESCONTO10"
            className="uppercase"
            value={codigo}
            aria-invalid={!!erro}
            aria-describedby={erro ? "cupom-erro" : undefined}
            disabled={!!cupom}
            onChange={(e) => {
              setCodigo(e.target.value.toUpperCase());
              setErro(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!cupom) void aplicar();
              }
            }}
          />
          {cupom ? (
            <Button type="button" variant="outline" onClick={remover}>
              Remover
            </Button>
          ) : (
            <Button type="button" variant="outline" disabled={validando} onClick={aplicar}>
              {validando && <Loader2Icon className="animate-spin" />} Aplicar
            </Button>
          )}
        </div>
        {erro && (
          <p id="cupom-erro" role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}
        {cupom && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Cupom {cupom.codigo} aplicado: {formatBRL(cupom.desconto)} de desconto.
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onVoltar}>
          Voltar
        </Button>
        <Button type="button" disabled={metodo === null} onClick={onAvancar}>
          Avançar
        </Button>
      </div>
    </section>
  );
}
