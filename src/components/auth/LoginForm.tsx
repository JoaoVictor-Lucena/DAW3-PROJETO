"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
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
  { label: "Demo: Admin", email: "admin@marketplace.com", senha: "admin123" },
  { label: "Demo: Vendedor", email: "vendedor1@eletronicos.com", senha: "senha123" },
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            {...register("senha")}
          />
          {errors.senha && (
            <p className="text-sm text-destructive">{errors.senha.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="size-4 animate-spin" />}
          Entrar
        </Button>
      </form>

      <div className="space-y-2 border-t pt-4">
        <p className="text-xs text-muted-foreground">Preenchimento rápido (demo)</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DEMOS.map((demo) => (
            <Button
              key={demo.email}
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => reset({ email: demo.email, senha: demo.senha })}
            >
              {demo.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
