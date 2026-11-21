import { Skeleton } from "@/components/ui/skeleton";

function AvisoCarregando() {
  return <span className="sr-only">Carregando…</span>;
}

export function CarregandoPagina() {
  return (
    <div role="status" aria-busy="true" aria-live="polite"
      className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <AvisoCarregando />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}

export function CarregandoGrade() {
  return (
    <div role="status" aria-busy="true" aria-live="polite"
      className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <AvisoCarregando />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full" />
        ))}
      </div>
    </div>
  );
}

export function CarregandoDetalhe() {
  return (
    <div role="status" aria-busy="true" aria-live="polite"
      className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8">
      <AvisoCarregando />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
