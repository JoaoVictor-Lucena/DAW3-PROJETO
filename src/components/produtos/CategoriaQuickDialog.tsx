"use client";

import * as React from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ApiError, getErrorMessage } from "@/services/api";
import { categoriaService } from "@/services/categoriaService";
import type { Categoria } from "@/types";

const schema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(50, "Máximo de 50 caracteres"),
  descricao: z.string().max(350, "Máximo de 350 caracteres"),
});

type FieldErrors = Partial<Record<"nome" | "descricao", string>>;

interface Props {
  onCreated: (categoria: Categoria) => void;
}

/**
 * Atalho para criar categoria. Não usa <form> de propósito: este componente é
 * renderizado dentro do formulário do produto e eventos de submit borbulham
 * pelos portais do React.
 */
export function CategoriaQuickDialog({ onCreated }: Props) {
  const [open, setOpen] = React.useState(false);
  const [nome, setNome] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [saving, setSaving] = React.useState(false);

  function handleOpenChange(next: boolean) {
    if (saving) return;
    setOpen(next);
    if (!next) {
      setNome("");
      setDescricao("");
      setErrors({});
    }
  }

  async function save() {
    const parsed = schema.safeParse({ nome, descricao });
    if (!parsed.success) {
      const fe: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        fe[key] ??= issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const categoria = await categoriaService.criar({
        nome: parsed.data.nome,
        descricao: parsed.data.descricao.trim() || undefined,
      });
      toast.success(`Categoria "${categoria.nome}" criada.`);
      onCreated(categoria);
      setSaving(false);
      setOpen(false);
      setNome("");
      setDescricao("");
      setErrors({});
    } catch (error) {
      setSaving(false);
      if (error instanceof ApiError && error.status === 400 && Object.keys(error.erros).length) {
        setErrors({ nome: error.erros.nome, descricao: error.erros.descricao });
      } else {
        toast.error(getErrorMessage(error));
      }
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon /> Nova Categoria
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova categoria</DialogTitle>
            <DialogDescription>
              Cadastre uma categoria rapidamente; ela será selecionada no produto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-nome">Nome</Label>
              <Input
                id="cat-nome"
                value={nome}
                aria-invalid={!!errors.nome}
                onChange={(e) => setNome(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void save();
                  }
                }}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-descricao">Descrição (opcional)</Label>
              <Textarea
                id="cat-descricao"
                value={descricao}
                aria-invalid={!!errors.descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              {errors.descricao && (
                <p className="text-sm text-destructive">{errors.descricao}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="button" disabled={saving} onClick={() => void save()}>
              {saving && <Loader2Icon className="animate-spin" />}
              Criar categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
