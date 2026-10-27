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
import { formatCpfCnpj, formatPhone } from "@/lib/format";
import { applyApiFieldErrors } from "@/lib/form-errors";
import { getErrorMessage } from "@/services/api";
import { authService } from "@/services/authService";

type Tipo = "CLIENTE" | "VENDEDOR";

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
    .trim()
    .min(3, "Razão social deve ter pelo menos 3 caracteres")
    .max(150, "Máximo de 150 caracteres")
    .refine((val) => /[a-zA-ZÀ-ÿ]/.test(val), "Razão social deve conter letras"),
  cnpjCpf: z
    .string()
    .min(1, "CNPJ/CPF é obrigatório")
    .max(18, "Máximo de 18 caracteres")
    .refine((val) => {
      const digits = val.replace(/\D/g, "").length;
      return digits === 11 || digits === 14;
    }, "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido"),
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
    setValue,
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
    options?: {
      type?: string;
      autoComplete?: string;
      maxLength?: number;
      placeholder?: string;
      inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
      formatter?: (raw: string) => string;
    },
  ) => {
    const registered = register(name);
    return (
      <div className="space-y-2">
        <Label htmlFor={`reg-${name}`}>{label}</Label>
        <Input
          id={`reg-${name}`}
          type={options?.type ?? "text"}
          autoComplete={options?.autoComplete}
          maxLength={options?.maxLength}
          placeholder={options?.placeholder}
          inputMode={options?.inputMode}
          {...registered}
          onChange={(e) => {
            if (options?.formatter) {
              const formatted = options.formatter(e.target.value);
              e.target.value = formatted;
              setValue(name, formatted, { shouldValidate: Boolean(errors[name]) });
            } else {
              registered.onChange(e);
            }
          }}
        />
        {errors[name] && (
          <p className="text-sm text-destructive">{errors[name]?.message}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {field("nome", "Nome", { type: "text", autoComplete: "name", maxLength: 100 })}
      {field("email", "E-mail", { type: "email", autoComplete: "email", maxLength: 100 })}
      {field("senha", "Senha", { type: "password", autoComplete: "new-password" })}
      {isVendedor ? (
        <>
          {field("razaoSocial", "Razão social", { maxLength: 150 })}
          {field("cnpjCpf", "CNPJ/CPF", {
            maxLength: 18,
            inputMode: "numeric",
            placeholder: "000.000.000-00 ou 00.000.000/0000-00",
            formatter: formatCpfCnpj,
          })}
        </>
      ) : (
        field("telefone", "Telefone (opcional)", {
          type: "tel",
          autoComplete: "tel",
          maxLength: 15,
          inputMode: "numeric",
          placeholder: "(00) 00000-0000",
          formatter: formatPhone,
        })
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
        Criar conta
      </Button>
    </form>
  );
}
