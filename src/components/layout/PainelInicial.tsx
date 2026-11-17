import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface AtalhoPainel {
  /** Sem href, o atalho aparece como "em breve" (ainda não implementado). */
  href?: string;
  titulo: string;
  descricao: string;
  Icon: LucideIcon;
}

/** Tela inicial de cada painel com os atalhos disponíveis para o perfil. */
export function PainelInicial({
  titulo,
  descricao,
  atalhos,
}: {
  titulo: string;
  descricao: string;
  atalhos: AtalhoPainel[];
}) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {atalhos.map(({ href, titulo: t, descricao: d, Icon }) => {
          const card = (
            <Card
              className={
                href
                  ? "h-full transition-colors group-hover:border-primary/50"
                  : "h-full border-dashed opacity-70"
              }
            >
              <CardHeader>
                <Icon className="size-5 text-primary" />
                <CardTitle className="text-base">{t}</CardTitle>
                <CardDescription>{d}</CardDescription>
              </CardHeader>
            </Card>
          );
          return href ? (
            <Link
              key={t}
              href={href}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {card}
            </Link>
          ) : (
            <div key={t} aria-disabled="true">
              {card}
            </div>
          );
        })}
      </div>
    </main>
  );
}
