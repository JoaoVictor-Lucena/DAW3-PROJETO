"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { SelectFiltro } from "@/components/admin/SelectFiltro";
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
import { applyApiFieldErrors } from "@/lib/form-errors";
import { formatCurrencyInput, numberToCurrencyInput, parseCurrencyInput } from "@/lib/format";
import { adminService } from "@/services/adminService";
import { getErrorMessage } from "@/services/api";
import type { CupomAdmin, StatusCupom } from "@/types";

function hojeISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const schema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "Código é obrigatório")
    .max(20, "Máximo de 20 caracteres")
    .regex(/^\S+$/, "Sem espaços"),
  valorDesconto: z.string().refine((v) => parseCurrencyInput(v) > 0, "Informe um valor maior que zero"),
  dataExpiracao: z.string().refine((v) => !v || v >= hojeISO(), "A validade não pode estar no passado"),
  status: z.enum(["ATIVO", "INATIVO"]),
});

type Valores = z.infer<typeof schema>;

const OPCOES_STATUS = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
];

/** Cria (cupom = null) ou edita um cupom de desconto. */
export function CupomFormDialog({
  aberto,
  cupom,
  onFechar,
  onSalvo,
}: {
  aberto: boolean;
  cupom: CupomAdmin | null;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    resolver: zodResolver(schema),
    defaultValues: { codigo: "", valorDesconto: "", dataExpiracao: "", status: "ATIVO" },
  });

  React.useEffect(() => {
    if (!aberto) return;
    reset({
      codigo: cupom?.codigo ?? "",
      valorDesconto: cupom ? numberToCurrencyInput(cupom.valorDesconto) : "",
      dataExpiracao: cupom?.dataExpiracao ?? "",
      status: cupom?.status ?? "ATIVO",
    });
  }, [aberto, cupom, reset]);

  async function onSubmit(valores: Valores) {
    const dto = {
      codigo: valores.codigo.toUpperCase(),
      valorDesconto: parseCurrencyInput(valores.valorDesconto),
      dataExpiracao: valores.dataExpiracao || undefined,
      status: valores.status,
    };
    try {
      if (cupom) {
        await adminService.atualizarCupom(cupom.id, dto);
        toast.success(`Cupom ${dto.codigo} atualizado.`);
      } else {
        await adminService.criarCupom(dto);
        toast.success(`Cupom ${dto.codigo} criado.`);
      }
      onSalvo();
      onFechar();
    } catch (error) {
      if (!applyApiFieldErrors(error, setError, ["codigo", "valorDesconto", "dataExpiracao", "status"])) {
        toast.error(getErrorMessage(error));
      }
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !isSubmitting && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cupom ? `Editar cupom ${cupom.codigo}` : "Novo cupom"}</DialogTitle>
        </DialogHeader>
        <form id="form-cupom" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="cupom-codigo">Código</Label>
            <Input
              id="cupom-codigo"
              placeholder="DESCONTO10"
              className="uppercase"
              aria-invalid={!!errors.codigo}
              {...register("codigo")}
            />
            {errors.codigo && <p className="text-sm text-destructive">{errors.codigo.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cupom-valor">Desconto (R$)</Label>
              <Controller
                control={control}
                name="valorDesconto"
                render={({ field }) => (
                  <Input
                    id="cupom-valor"
                    inputMode="numeric"
                    placeholder="0,00"
                    aria-invalid={!!errors.valorDesconto}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(formatCurrencyInput(e.target.value))}
                  />
                )}
              />
              {errors.valorDesconto && (
                <p className="text-sm text-destructive">{errors.valorDesconto.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cupom-validade">Validade (opcional)</Label>
              <Input
                id="cupom-validade"
                type="date"
                min={hojeISO()}
                aria-invalid={!!errors.dataExpiracao}
                {...register("dataExpiracao")}
              />
              {errors.dataExpiracao && (
                <p className="text-sm text-destructive">{errors.dataExpiracao.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <SelectFiltro
                  opcoes={OPCOES_STATUS}
                  value={field.value}
                  className="w-full"
                  ariaLabel="Status do cupom"
                  onChange={(v) => field.onChange((v || "ATIVO") as StatusCupom)}
                />
              )}
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-cupom" disabled={isSubmitting}>
            {isSubmitting && <Loader2Icon className="animate-spin" />}
            {cupom ? "Salvar" : "Criar cupom"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
