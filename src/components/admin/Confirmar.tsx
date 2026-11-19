"use client";

import * as React from "react";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getErrorMessage } from "@/services/api";

export interface PedidoConfirmacao {
  titulo: string;
  descricao: string;
  acao: string;
  destrutiva?: boolean;
  /** Texto do botão que fecha sem fazer nada (padrão: "Cancelar"). */
  voltar?: string;
  executar: () => Promise<void>;
}

/** Diálogo de confirmação genérico do painel (excluir, bloquear, limpar banco...). */
export function Confirmar({
  pedido,
  onFechar,
}: {
  pedido: PedidoConfirmacao | null;
  onFechar: () => void;
}) {
  const [executando, setExecutando] = React.useState(false);

  async function confirmar() {
    if (!pedido || executando) return;
    setExecutando(true);
    try {
      await pedido.executar();
      onFechar();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExecutando(false);
    }
  }

  return (
    <AlertDialog
      open={pedido !== null}
      onOpenChange={(aberto) => {
        if (!aberto && !executando) onFechar();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {pedido?.destrutiva && (
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlertIcon />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{pedido?.titulo}</AlertDialogTitle>
          <AlertDialogDescription>{pedido?.descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={executando}>{pedido?.voltar ?? "Cancelar"}</AlertDialogCancel>
          <AlertDialogAction
            variant={pedido?.destrutiva ? "destructive" : "default"}
            disabled={executando}
            onClick={(e) => {
              e.preventDefault();
              void confirmar();
            }}
          >
            {executando && <Loader2Icon className="animate-spin" />}
            {pedido?.acao}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
