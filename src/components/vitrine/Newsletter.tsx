"use client";

import * as React from "react";
import { MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [enviado, setEnviado] = React.useState(false);

  function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviado(true);
  }

  return (
    <section
      aria-labelledby="titulo-newsletter"
      className="flex flex-col items-center gap-4 rounded-xl bg-muted px-6 py-10 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <MailIcon className="size-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 id="titulo-newsletter" className="text-xl font-bold">
          Receba ofertas e novidades
        </h2>
        <p className="text-sm text-muted-foreground">
          Cadastre seu e-mail e fique por dentro das promoções das lojas parceiras.
        </p>
      </div>

      {enviado ? (
        <p role="status" className="text-sm font-medium">
          Obrigado pelo interesse! 🎉
        </p>
      ) : (
        <form onSubmit={aoEnviar} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            required
            placeholder="Seu melhor e-mail"
            aria-label="Seu e-mail"
            autoComplete="email"
            className="h-9 sm:flex-1"
          />
          <Button type="submit" size="lg">
            Quero receber
          </Button>
        </form>
      )}
    </section>
  );
}
