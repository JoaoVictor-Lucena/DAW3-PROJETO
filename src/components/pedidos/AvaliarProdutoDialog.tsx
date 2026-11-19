"use client";

import * as React from "react";
import { Loader2Icon, StarIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ApiError, getErrorMessage } from "@/services/api";
import { avaliacaoService } from "@/services/avaliacaoService";

const MAX_COMENTARIO = 350;

export interface ProdutoParaAvaliar {
  idProduto: number;
  nomeProduto: string;
}

/** Nota de 1 a 5 estrelas e comentário opcional para um produto recebido. */
export function AvaliarProdutoDialog({
  produto,
  onFechar,
  onAvaliado,
}: {
  produto: ProdutoParaAvaliar | null;
  onFechar: () => void;
  onAvaliado: (idProduto: number) => void;
}) {
  const [nota, setNota] = React.useState(0);
  const [comentario, setComentario] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  function fechar() {
    if (enviando) return;
    setNota(0);
    setComentario("");
    setErro(null);
    onFechar();
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!produto) return;
    if (nota < 1) {
      setErro("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await avaliacaoService.criar({
        idProduto: produto.idProduto,
        nota,
        comentario: comentario.trim() || undefined,
      });
      toast.success("Obrigado pela avaliação!");
      onAvaliado(produto.idProduto);
      setEnviando(false);
      setNota(0);
      setComentario("");
      onFechar();
    } catch (error) {
      setEnviando(false);
      const campo =
        error instanceof ApiError ? (error.erros.nota ?? error.erros.comentario) : undefined;
      if (campo) setErro(campo);
      else toast.error(getErrorMessage(error));
    }
  }

  return (
    <Dialog open={produto !== null} onOpenChange={(o) => !o && fechar()}>
      <DialogContent>
        <form onSubmit={enviar} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Avaliar produto</DialogTitle>
            <DialogDescription>{produto?.nomeProduto}</DialogDescription>
          </DialogHeader>

          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Nota</legend>
            <div className="flex gap-1" role="radiogroup" aria-label="Nota de 1 a 5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={nota === n}
                  aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
                  className="rounded-md p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    setNota(n);
                    setErro(null);
                  }}
                >
                  <StarIcon
                    className={cn(
                      "size-7",
                      n <= nota ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
                    )}
                  />
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="comentario-avaliacao">Comentário (opcional)</Label>
            <Textarea
              id="comentario-avaliacao"
              rows={3}
              maxLength={MAX_COMENTARIO}
              placeholder="Conte o que achou do produto."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-destructive">{erro}</span>
              <span className="text-muted-foreground">
                {comentario.length}/{MAX_COMENTARIO}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={enviando} onClick={fechar}>
              Voltar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando && <Loader2Icon className="animate-spin" />}
              Enviar avaliação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
