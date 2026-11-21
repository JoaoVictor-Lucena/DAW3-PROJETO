"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

export function BuscaProdutos({
  className,
  onBuscar,
}: {
  className?: string;
  onBuscar?: () => void;
}) {
  const router = useRouter();
  const [busca, setBusca] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const termo = busca.trim();
    router.push(termo ? `/busca?q=${encodeURIComponent(termo)}` : "/busca");
    onBuscar?.();
  }

  return (
    <form role="search" onSubmit={submit} className={className}>
      <div className="relative w-full">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produtos..."
          aria-label="Buscar produtos"
          className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
      </div>
    </form>
  );
}
