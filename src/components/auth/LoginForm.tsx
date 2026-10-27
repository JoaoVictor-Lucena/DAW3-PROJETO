"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, ShieldCheckIcon, SparklesIcon, StoreIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { applyApiFieldErrors } from "@/lib/form-errors";
import { getErrorMessage } from "@/services/api";

const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

type LoginValues = z.infer<typeof loginSchema>;

const DEMOS = [
  {
    label: "Demo: Admin",
    hint: "admin@marketplace.com",
    email: "admin@marketplace.com",
    senha: "admin123",
    Icon: ShieldCheckIcon,
  },
  {
    label: "Demo: Vendedor",
    hint: "vendedor1@eletronicos.com",
    email: "vendedor1@eletronicos.com",
    senha: "senha123",
    Icon: StoreIcon,
  },
] as const;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", senha: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      const user = await login(values);
      toast.success(`Bem-vindo, ${user.email}!`);
      router.replace("/produtos");
    } catch (error) {
      if (!applyApiFieldErrors(error, setError, ["email", "senha"])) {
        toast.error(getErrorMessage(error));
      }
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            placeholder="••••••"
            autoComplete="current-password"
            aria-invalid={!!errors.senha}
            {...register("senha")}
          />
          {errors.senha && (
            <p className="text-sm text-destructive">{errors.senha.message}</p>
          )}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
          Entrar
        </Button>
      </form>

      <div className="space-y-2.5 rounded-lg border border-dashed bg-muted/40 p-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <SparklesIcon className="size-3.5 text-primary" />
          Preenchimento Rápido (Demo)
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DEMOS.map(({ label, hint, email, senha, Icon }) => (
            <Button
              key={email}
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              title={`Preencher ${hint}`}
              onClick={() => reset({ email, senha })}
            >
              <Icon className="size-3.5 text-muted-foreground" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
