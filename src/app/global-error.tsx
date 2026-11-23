"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center p-6">
        <div role="alert" className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Algo deu errado</h1>
          <p className="text-sm text-neutral-600">Ocorreu um erro inesperado. Tente recarregar a página.</p>
          <button type="button" onClick={reset}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2">
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
