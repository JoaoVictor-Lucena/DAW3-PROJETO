"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyApiFieldErrors } from "@/lib/form-errors";
import { getErrorMessage } from "@/services/api";
import { authService } from "@/services/authService";

type Tipo = "CLIENTE" | "VENDEDOR";

// Espelha as regras do back-end (Bean Validation).
const baseShape = {
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Máximo de 100 caracteres"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .max(100, "Máximo de 100 caracteres"),
  senha: z.string().min(6, "Mínimo de 6 caracteres"),
};

const clienteSchema = z.object({
  ...baseShape,
  telefone: z.string().max(20, "Máximo de 20 caracteres"),
  razaoSocial: z.string(),
  cnpjCpf: z.string(),
});

const vendedorSchema = z.object({
  ...baseShape,
  telefone: z.string(),
  razaoSocial: z
    .string()
    .min(1, "Razão social é obrigatória")
    .max(150, "Máximo de 150 caracteres"),
  cnpjCpf: z.string().min(1, "CNPJ/CPF é obrigatório").max(18, "Máximo de 18 caracteres"),
});

type RegisterValues = z.infer<typeof vendedorSchema>;

const FIELDS = ["nome", "email", "senha", "telefone", "razaoSocial", "cnpjCpf"] as const;

export function RegisterForm({ onRegistered }: { onRegistered: () => void }) {
  const [tipo, setTipo] = React.useState<Tipo>("CLIENTE");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {(["CLIENTE", "VENDEDOR"] as const).map((t) => (
          <Button
            key={t}
            type="button"
            size="sm"
            variant={tipo === t ? "secondary" : "outline"}
            aria-pressed={tipo === t}
            onClick={() => setTipo(t)}
          >
            {t === "CLIENTE" ? "Cliente" : "Vendedor"}
          </Button>
        ))}
      </div>
      {/* key força o reset do formulário (e do resolver) ao trocar o tipo */}
      <RegisterFields key={tipo} tipo={tipo} onRegistered={onRegistered} />
    </div>
  );
}

function RegisterFields({
  tipo,
  onRegistered,
}: {
  tipo: Tipo;
  onRegistered: () => void;
}) {
  const isVendedor = tipo === "VENDEDOR";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(isVendedor ? vendedorSchema : clienteSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      telefone: "",
      razaoSocial: "",
      cnpjCpf: "",
    },
  });

  async function onSubmit(v: RegisterValues) {
    try {
      if (isVendedor) {
        await authService.registrarVendedor({
          nome: v.nome,
          email: v.email,
          senha: v.senha,
          razaoSocial: v.razaoSocial,
          cnpjCpf: v.cnpjCpf,
        });
      } else {
        await authService.registrarCliente({
          nome: v.nome,
          email: v.email,
          senha: v.senha,
          telefone: v.telefone || undefined,
        });
      }
      toast.success("Conta criada! Agora é só entrar.");
      onRegistered();
    } catch (error) {
      if (!applyApiFieldErrors(error, setError, FIELDS)) {
        toast.error(getErrorMessage(error));
      }
    }
  }

  const field = (
    name: keyof RegisterValues,
    label: string,
    type = "text",
    autoComplete?: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`reg-${name}`}>{label}</Label>
      <Input
        id={`reg-${name}`}
        type={type}
        autoComplete={autoComplete}
        {...register(name)}
      />
      {errors[name] && (
        <p className="text-sm text-destructive">{errors[name]?.message}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {field("nome", "Nome", "text", "name")}
      {field("email", "E-mail", "email", "email")}
      {field("senha", "Senha", "password", "new-password")}
      {isVendedor ? (
        <>
          {field("razaoSocial", "Razão social")}
          {field("cnpjCpf", "CNPJ/CPF")}
        </>
      ) : (
        field("telefone", "Telefone (opcional)", "tel", "tel")
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
        Criar conta
      </Button>
    </form>
  );
}
