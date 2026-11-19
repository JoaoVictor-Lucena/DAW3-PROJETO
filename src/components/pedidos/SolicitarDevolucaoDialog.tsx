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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, getErrorMessage } from "@/services/api";
import { pedidoService } from "@/services/pedidoService";

const MAX_MOTIVO = 1000;

/** Pede o motivo e solicita a devolução de um pedido entregue. */
export function SolicitarDevolucaoDialog({
  idPedido,
  aberto,
  onFechar,
  onSolicitada,
}: {
  idPedido: number;
  aberto: boolean;
  onFechar: () => void;
  onSolicitada: () => void;
}) {
  const [motivo, setMotivo] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = motivo.trim();
    if (!texto) {
      setErro("Conte o motivo da devolução.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await pedidoService.solicitarDevolucao(idPedido, texto);
      toast.success("Devolução solicitada. O vendedor vai analisar o pedido.");
      setMotivo("");
      onSolicitada();
      onFechar();
    } catch (error) {
      const campo = error instanceof ApiError ? error.erros.motivo : undefined;
      if (campo) setErro(campo);
      else toast.error(getErrorMessage(error));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !enviando && onFechar()}>
      <DialogContent>
        <form onSubmit={enviar} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Solicitar devolução</DialogTitle>
            <DialogDescription>
              Pedido #{idPedido}. Depois de enviar, o vendedor aprova ou recusa a devolução.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="motivo-devolucao">Motivo</Label>
            <Textarea
              id="motivo-devolucao"
              placeholder="Ex.: o produto chegou com defeito."
              rows={4}
              maxLength={MAX_MOTIVO}
              value={motivo}
              aria-invalid={!!erro}
              aria-describedby={erro ? "motivo-devolucao-erro" : undefined}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErro(null);
              }}
            />
            <div className="flex justify-between gap-2 text-xs">
              <span id="motivo-devolucao-erro" className="text-destructive">
                {erro}
              </span>
              <span className="text-muted-foreground">
                {motivo.length}/{MAX_MOTIVO}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={enviando} onClick={onFechar}>
              Voltar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando && <Loader2Icon className="animate-spin" />}
              Solicitar devolução
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
