"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { applyApiFieldErrors } from "@/lib/form-errors";
import { ApiError, getErrorMessage } from "@/services/api";
import { authService } from "@/services/authService";

const excluirSchema = z.object({
  senha: z
    .string()
    .min(1, "Informe sua senha atual para confirmar")
    .refine((valor) => valor.trim().length > 0, "Informe sua senha atual para confirmar"),
});

type ExcluirValues = z.infer<typeof excluirSchema>;

const FIELDS = ["senha"] as const;

interface ExcluirLojaDialogProps {
  open: boolean;
  nomeLoja: string;
  onOpenChange: (open: boolean) => void;
}

export function ExcluirLojaDialog({ open, nomeLoja, onOpenChange }: ExcluirLojaDialogProps) {
  const { logout } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExcluirValues>({
    resolver: zodResolver(excluirSchema),
    defaultValues: { senha: "" },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    if (!nextOpen) reset({ senha: "" });
    onOpenChange(nextOpen);
  }

  async function onSubmit(values: ExcluirValues) {
    try {
      await authService.excluirConta(values.senha);
      toast.success("Sua conta e sua loja foram excluídas.");
      reset({ senha: "" });
      onOpenChange(false);
      logout();
    } catch (error) {
      const mapped =
        error instanceof ApiError &&
        error.status === 400 &&
        applyApiFieldErrors(error, setError, FIELDS);
      if (!mapped) toast.error(getErrorMessage(error));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Excluir conta e loja definitivamente?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é irreversível para{" "}
            <strong className="font-semibold text-foreground">{nomeLoja}</strong>. Se houver
            pedidos em andamento, a exclusão será bloqueada. Sem histórico de pedidos, sua conta
            será apagada; com histórico, a loja será anonimizada e seus produtos serão pausados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form id="form-excluir-loja" onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="excluir-loja-senha">Senha atual</Label>
            <Input
              id="excluir-loja-senha"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha atual"
              disabled={isSubmitting}
              aria-invalid={!!errors.senha}
              aria-describedby={errors.senha ? "excluir-loja-senha-erro" : undefined}
              {...register("senha")}
            />
            {errors.senha && (
              <p id="excluir-loja-senha-erro" className="text-xs text-destructive">
                {errors.senha.message}
              </p>
            )}
          </div>
        </form>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            type="submit"
            form="form-excluir-loja"
            variant="destructive"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            Excluir definitivamente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
