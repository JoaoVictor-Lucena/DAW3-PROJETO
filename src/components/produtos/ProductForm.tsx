"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { CategoriaQuickDialog } from "@/components/produtos/CategoriaQuickDialog";
import { buttonVariants, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  formatCurrencyInput,
  numberToCurrencyInput,
  parseCurrencyInput,
} from "@/lib/format";
import { applyApiFieldErrors } from "@/lib/form-errors";
import { ApiError, getErrorMessage } from "@/services/api";
import { categoriaService } from "@/services/categoriaService";
import { vendedorService } from "@/services/vendedorService";
import type { Categoria, Produto, ProdutoRequest, Vendedor } from "@/types";

// Os campos numéricos ficam como string no formulário e são convertidos no submit.
function toInt(raw: string): number {
  return Number(raw.trim().replace(",", "."));
}

function createSchema(isAdmin: boolean) {
  return z.object({
    nome: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(150, "Máximo de 150 caracteres"),
    descricao: z.string().max(500, "Máximo de 500 caracteres"),
    preco: z
      .string()
      .trim()
      .min(1, "Preço é obrigatório")
      .refine((v) => Number.isFinite(parseCurrencyInput(v)), "Informe um número válido")
      .refine((v) => parseCurrencyInput(v) > 0, "O preço deve ser maior que 0"),
    estoque: z
      .string()
      .trim()
      .min(1, "Estoque é obrigatório")
      .refine((v) => Number.isInteger(toInt(v)), "O estoque deve ser um número inteiro")
      .refine((v) => toInt(v) >= 0, "O estoque deve ser maior ou igual a 0"),
    idCategoria: z.string().min(1, "Selecione uma categoria"),
    idVendedor: isAdmin ? z.string().min(1, "Selecione um vendedor") : z.string(),
  });
}

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const FIELDS = [
  "nome",
  "descricao",
  "preco",
  "estoque",
  "idCategoria",
  "idVendedor",
] as const;

interface Props {
  /** Produto existente (modo edição). */
  produto?: Produto;
  submitLabel?: string;
  /** Deve lançar (ApiError) em caso de falha; o sucesso/redirect é responsabilidade da página. */
  onSubmit: (dto: ProdutoRequest) => Promise<void>;
}

export function ProductForm({ produto, submitLabel = "Salvar", onSubmit }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [categorias, setCategorias] = React.useState<Categoria[]>([]);
  const [vendedores, setVendedores] = React.useState<Vendedor[]>([]);

  const schema = React.useMemo(() => createSchema(isAdmin), [isAdmin]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: produto?.nome ?? "",
      descricao: produto?.descricao ?? "",
      preco: produto ? numberToCurrencyInput(produto.preco) : "",
      estoque: produto ? String(produto.estoque) : "",
      idCategoria: produto ? String(produto.idCategoria) : "",
      idVendedor: produto ? String(produto.idVendedor) : "",
    },
  });

  React.useEffect(() => {
    let cancelled = false;
    categoriaService
      .listarTodas()
      .then((c) => !cancelled && setCategorias(c))
      .catch((e) => !cancelled && toast.error(getErrorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    vendedorService
      .listarTodos()
      .then((v) => !cancelled && setVendedores(v))
      .catch((e) => !cancelled && toast.error(getErrorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const categoriaItems = React.useMemo(
    () => categorias.map((c) => ({ value: String(c.id), label: c.nome })),
    [categorias],
  );
  const vendedorItems = React.useMemo(
    () =>
      vendedores.map((v) => ({
        value: String(v.id),
        label: `${v.nome} (${v.razaoSocial})`,
      })),
    [vendedores],
  );

  function handleCategoriaCriada(nova: Categoria) {
    setCategorias((prev) => [...prev, nova]);
    setValue("idCategoria", String(nova.id), { shouldValidate: true, shouldDirty: true });
  }

  async function submit(values: FormValues) {
    const dto: ProdutoRequest = {
      nome: values.nome.trim(),
      descricao: values.descricao.trim() || undefined,
      preco: parseCurrencyInput(values.preco),
      estoque: toInt(values.estoque),
      idCategoria: Number(values.idCategoria),
      // VENDEDOR: o back-end usa o id do token, então o campo não é enviado.
      ...(isAdmin ? { idVendedor: Number(values.idVendedor) } : {}),
    };

    try {
      await onSubmit(dto);
    } catch (error) {
      const mapped =
        error instanceof ApiError &&
        error.status === 400 &&
        applyApiFieldErrors(error, setError, FIELDS);
      // 400 com campos mapeados fica inline; demais (403/404/409/422...) viram toast com `detail`
      if (!mapped) toast.error(getErrorMessage(error));
    }
  }

  const fieldError = (name: keyof FormValues) =>
    errors[name] && <p className="text-sm text-destructive">{errors[name]?.message}</p>;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" aria-invalid={!!errors.nome} {...register("nome")} />
        {fieldError("nome")}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Textarea
          id="descricao"
          rows={4}
          aria-invalid={!!errors.descricao}
          {...register("descricao")}
        />
        {fieldError("descricao")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="preco">Preço (R$)</Label>
          <Controller
            control={control}
            name="preco"
            render={({ field }) => (
              <Input
                id="preco"
                inputMode="numeric"
                placeholder="0,00"
                aria-invalid={!!errors.preco}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(formatCurrencyInput(e.target.value))}
              />
            )}
          />
          {fieldError("preco")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estoque">Estoque</Label>
          <Input
            id="estoque"
            inputMode="numeric"
            placeholder="0"
            aria-invalid={!!errors.estoque}
            {...register("estoque")}
          />
          {fieldError("estoque")}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label>Categoria</Label>
          <CategoriaQuickDialog onCreated={handleCategoriaCriada} />
        </div>
        <Controller
          control={control}
          name="idCategoria"
          render={({ field }) => (
            <Select
              items={categoriaItems}
              value={field.value || null}
              onValueChange={(v) => field.onChange(v ?? "")}
            >
              <SelectTrigger className="w-full" aria-invalid={!!errors.idCategoria}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriaItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {fieldError("idCategoria")}
      </div>

      {isAdmin && (
        <div className="space-y-1.5">
          <Label>Vendedor</Label>
          <Controller
            control={control}
            name="idVendedor"
            render={({ field }) => (
              <Select
                items={vendedorItems}
                value={field.value || null}
                onValueChange={(v) => field.onChange(v ?? "")}
              >
                <SelectTrigger className="w-full" aria-invalid={!!errors.idVendedor}>
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {vendedorItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {fieldError("idVendedor")}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Link href="/produtos" className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
