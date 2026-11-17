"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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
import { applyApiFieldErrors } from "@/lib/form-errors";
import { adminService } from "@/services/adminService";
import { getErrorMessage } from "@/services/api";

const schema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Máximo de 100 caracteres"),
  email: z.string().trim().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo de 6 caracteres"),
});

type Valores = z.infer<typeof schema>;

const CAMPOS = [
  { name: "nome", label: "Nome", type: "text", autoComplete: "name" },
  { name: "email", label: "E-mail", type: "email", autoComplete: "off" },
  { name: "senha", label: "Senha inicial", type: "password", autoComplete: "new-password" },
] as const;

export function NovoAdminDialog({
  open,
  onOpenChange,
  onCriado,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriado: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", email: "", senha: "" },
  });

  function fechar(aberto: boolean) {
    if (isSubmitting) return;
    onOpenChange(aberto);
    if (!aberto) reset();
  }

  async function onSubmit(valores: Valores) {
    try {
      await adminService.criarAdmin(valores);
      toast.success(`Admin "${valores.nome}" criado.`);
      reset();
      onOpenChange(false);
      onCriado();
    } catch (error) {
      if (!applyApiFieldErrors(error, setError, ["nome", "email", "senha"])) {
        toast.error(getErrorMessage(error));
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo administrador</DialogTitle>
          <DialogDescription>
            O novo admin terá acesso total ao painel. Combine a senha inicial com ele.
          </DialogDescription>
        </DialogHeader>
        <form id="novo-admin" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {CAMPOS.map((campo) => (
            <div key={campo.name} className="space-y-1.5">
              <Label htmlFor={`admin-${campo.name}`}>{campo.label}</Label>
              <Input
                id={`admin-${campo.name}`}
                type={campo.type}
                autoComplete={campo.autoComplete}
                aria-invalid={!!errors[campo.name]}
                {...register(campo.name)}
              />
              {errors[campo.name] && (
                <p className="text-sm text-destructive">{errors[campo.name]?.message}</p>
              )}
            </div>
          ))}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => fechar(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="novo-admin" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            Criar admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
