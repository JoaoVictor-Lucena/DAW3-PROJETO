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
import { ApiError, getErrorMessage } from "@/services/api";
import { produtoService } from "@/services/produtoService";
import type { Produto } from "@/types";

interface Props {
  produto: Produto | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (produto: Produto) => void;
}

export function DeleteProductModal({ produto, onOpenChange, onDeleted }: Props) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleConfirm() {
    if (!produto || deleting) return;
    setDeleting(true);
    try {
      await produtoService.remover(produto.id);
      toast.success(`Produto "${produto.nome}" excluído com sucesso.`);
      setDeleting(false);
      onOpenChange(false);
      onDeleted(produto);
    } catch (error) {
      setDeleting(false);
      if (error instanceof ApiError && error.status === 409) {
        toast.error(error.problem.title || "Conflito ao excluir", {
          description:
            error.problem.detail ||
            "Este produto está vinculado a um pedido ou item e não pode ser removido.",
        });
      } else {
        toast.error(getErrorMessage(error));
      }
    }
  }

  return (
    <AlertDialog
      open={!!produto}
      onOpenChange={(open) => {
        if (!deleting) onOpenChange(open);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o produto{" "}
            <strong className="font-semibold text-foreground">{produto?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
          >
            {deleting && <Loader2Icon className="animate-spin" />}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
