"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/admin-labels";
import { applyApiFieldErrors } from "@/lib/form-errors";
import { formatCpfCnpj } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { ApiError, getErrorMessage } from "@/services/api";
import { painelVendedorService } from "@/services/painelVendedorService";
import type { PerfilLojaRequest, Vendedor } from "@/types";

const URL_IMAGEM = /^https?:\/\/\S+$/i;
const MAX_DESCRICAO = 500;

const lojaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Máximo de 100 caracteres"),
  razaoSocial: z
    .string()
    .trim()
    .min(1, "Razão social é obrigatória")
    .max(150, "Máximo de 150 caracteres"),
  descricao: z.string().trim().max(MAX_DESCRICAO, `Máximo de ${MAX_DESCRICAO} caracteres`),
  bannerUrl: z
    .string()
    .trim()
    .max(500, "Máximo de 500 caracteres")
    .refine(
      (val) => !val || URL_IMAGEM.test(val),
      "Informe uma URL que comece com http:// ou https://",
    ),
});

type LojaFormValues = z.infer<typeof lojaSchema>;

const FIELDS = ["nome", "razaoSocial", "descricao", "bannerUrl"] as const;

interface LojaFormCardProps {
  vendedor: Vendedor;
  onAtualizado: () => void;
}

export function LojaFormCard({ vendedor, onAtualizado }: LojaFormCardProps) {
  const { atualizarUsuario } = useAuth();
  const [capaFalhou, setCapaFalhou] = React.useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LojaFormValues>({
    resolver: zodResolver(lojaSchema),
    defaultValues: {
      nome: vendedor.nome,
      razaoSocial: vendedor.razaoSocial,
      descricao: vendedor.descricao ?? "",
      bannerUrl: vendedor.bannerUrl ?? "",
    },
  });

  const descricaoAtual = useWatch({ control, name: "descricao" }) ?? "";
  const bannerUrlAtual = (useWatch({ control, name: "bannerUrl" }) ?? "").trim();
  const previaBanner = URL_IMAGEM.test(bannerUrlAtual) ? bannerUrlAtual : null;

  async function onSubmit(values: LojaFormValues) {
    // Campos opcionais vazios vão como "": o back-end entende como remover a descrição ou a capa.
    const dto: PerfilLojaRequest = {
      nome: values.nome.trim(),
      razaoSocial: values.razaoSocial.trim(),
      descricao: values.descricao.trim(),
      bannerUrl: values.bannerUrl.trim(),
    };

    try {
      const atualizado = await painelVendedorService.atualizarPerfil(vendedor.id, dto);
      // O nome do responsável aparece no header: atualiza a sessão para refletir na hora.
      atualizarUsuario({ nome: atualizado.nome });
      reset({
        nome: atualizado.nome,
        razaoSocial: atualizado.razaoSocial,
        descricao: atualizado.descricao ?? "",
        bannerUrl: atualizado.bannerUrl ?? "",
      });
      toast.success("Dados da loja atualizados com sucesso.");
      onAtualizado();
    } catch (error) {
      const mapped =
        error instanceof ApiError &&
        error.status === 400 &&
        applyApiFieldErrors(error, setError, FIELDS);
      if (!mapped) toast.error(getErrorMessage(error));
    }
  }

  const erroCampo = (campo: keyof LojaFormValues) =>
    errors[campo] && (
      <p id={`loja-${campo}-erro`} className="text-xs text-destructive">
        {errors[campo]?.message}
      </p>
    );

  const aria = (campo: keyof LojaFormValues) => ({
    "aria-invalid": !!errors[campo],
    "aria-describedby": errors[campo] ? `loja-${campo}-erro` : undefined,
  });

  const documentoFormatado = vendedor.cnpjCpf ? formatCpfCnpj(vendedor.cnpjCpf) : "—";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da loja</CardTitle>
        <CardDescription>
          Atualize as informações exibidas aos clientes.
          {vendedor.dataCadastro && ` Vendendo desde ${formatDate(vendedor.dataCadastro)}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="loja-cnpjCpf">CNPJ/CPF</Label>
              <Input
                id="loja-cnpjCpf"
                value={documentoFormatado}
                readOnly
                disabled
                className="cursor-not-allowed bg-muted/50 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Documento cadastrado na criação da loja (somente leitura).
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loja-email">E-mail</Label>
              <Input
                id="loja-email"
                type="email"
                value={vendedor.email}
                readOnly
                disabled
                className="cursor-not-allowed bg-muted/50 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Identificador de acesso da conta (somente leitura).
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="loja-razaoSocial">Nome da loja (razão social)</Label>
              <Input
                id="loja-razaoSocial"
                disabled={isSubmitting}
                {...aria("razaoSocial")}
                {...register("razaoSocial")}
              />
              {erroCampo("razaoSocial")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loja-nome">Nome do responsável</Label>
              <Input
                id="loja-nome"
                disabled={isSubmitting}
                {...aria("nome")}
                {...register("nome")}
              />
              {erroCampo("nome")}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="loja-descricao">
              Descrição <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="loja-descricao"
              rows={4}
              placeholder="Conte o que sua loja vende e o que a torna especial."
              disabled={isSubmitting}
              {...aria("descricao")}
              {...register("descricao")}
            />
            <div className="flex justify-between gap-2 text-xs">
              <span>{erroCampo("descricao")}</span>
              <span
                className={
                  descricaoAtual.trim().length > MAX_DESCRICAO
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                {descricaoAtual.trim().length}/{MAX_DESCRICAO}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="loja-bannerUrl">
              Imagem de capa <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="loja-bannerUrl"
              type="url"
              inputMode="url"
              placeholder="https://..."
              disabled={isSubmitting}
              {...aria("bannerUrl")}
              {...register("bannerUrl")}
            />
            {erroCampo("bannerUrl")}
            {previaBanner &&
              (capaFalhou === previaBanner ? (
                <p className="text-xs text-muted-foreground">
                  Não foi possível carregar a imagem deste link para a prévia.
                </p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previaBanner}
                  alt="Prévia da capa da loja"
                  className="mt-2 aspect-[4/1] w-full rounded-md border bg-muted object-cover"
                  onError={() => setCapaFalhou(previaBanner)}
                />
              ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Salvar alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
