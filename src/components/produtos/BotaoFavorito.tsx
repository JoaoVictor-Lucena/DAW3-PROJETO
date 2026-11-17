"use client";

import * as React from "react";
import { HeartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFavoritos } from "@/context/FavoritosContext";
import { cn } from "@/lib/utils";

/**
 * Coração para favoritar um produto. Aparece para cliente e visitante (o visitante vai para o login);
 * vendedor e admin não veem.
 */
export function BotaoFavorito({
  idProduto,
  nome,
  comTexto = false,
  className,
}: {
  idProduto: number;
  nome?: string;
  comTexto?: boolean;
  className?: string;
}) {
  const { disponivel, isFavorito, alternar } = useFavoritos();
  const [salvando, setSalvando] = React.useState(false);
  if (!disponivel) return null;

  const favorito = isFavorito(idProduto);
  const rotulo = favorito ? "Remover da lista de desejos" : "Adicionar à lista de desejos";

  async function clicar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSalvando(true);
    await alternar(idProduto, nome);
    setSalvando(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={comTexto ? "default" : "icon"}
      aria-pressed={favorito}
      aria-label={comTexto ? undefined : `${rotulo}${nome ? `: ${nome}` : ""}`}
      title={rotulo}
      disabled={salvando}
      onClick={(e) => void clicar(e)}
      className={className}
    >
      <HeartIcon
        className={cn("transition-colors", favorito && "fill-rose-500 text-rose-500")}
      />
      {comTexto && (favorito ? "Na lista de desejos" : "Favoritar")}
    </Button>
  );
}
