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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applyApiFieldErrors } from "@/lib/form-errors";
import { getErrorMessage } from "@/services/api";
import { categoriaService } from "@/services/categoriaService";
import type { Categoria } from "@/types";

const schema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(50, "Máximo de 50 caracteres"),
  descricao: z.string().max(350, "Máximo de 350 caracteres"),
});

type Valores = z.infer<typeof schema>;

/** Cria (categoria = null) ou edita uma categoria. `aberto` controla a exibição. */
export function CategoriaFormDialog({
  aberto,
  categoria,
  onFechar,
  onSalvo,
}: {
  aberto: boolean;
  categoria: Categoria | null;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({ resolver: zodResolver(schema), defaultValues: { nome: "", descricao: "" } });

  React.useEffect(() => {
    if (aberto) reset({ nome: categoria?.nome ?? "", descricao: categoria?.descricao ?? "" });
  }, [aberto, categoria, reset]);

  async function onSubmit(valores: Valores) {
    const dto = { nome: valores.nome, descricao: valores.descricao.trim() || undefined };
    try {
      if (categoria) {
        await categoriaService.atualizar(categoria.id, dto);
        toast.success(`Categoria "${dto.nome}" atualizada.`);
      } else {
        await categoriaService.criar(dto);
        toast.success(`Categoria "${dto.nome}" criada.`);
      }
      onSalvo();
      onFechar();
    } catch (error) {
      if (!applyApiFieldErrors(error, setError, ["nome", "descricao"])) {
        toast.error(getErrorMessage(error));
      }
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !isSubmitting && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoria ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>
        <form id="form-categoria" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="cat-nome">Nome</Label>
            <Input id="cat-nome" aria-invalid={!!errors.nome} {...register("nome")} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-descricao">Descrição (opcional)</Label>
            <Textarea id="cat-descricao" aria-invalid={!!errors.descricao} {...register("descricao")} />
            {errors.descricao && <p className="text-sm text-destructive">{errors.descricao.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-categoria" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {categoria ? "Salvar" : "Criar categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
