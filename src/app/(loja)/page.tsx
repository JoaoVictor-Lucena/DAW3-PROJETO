"use client";

import { Button } from "@/components/ui/button";
import { AtalhosCategorias } from "@/components/vitrine/AtalhosCategorias";
import { CarrosselBanners } from "@/components/vitrine/CarrosselBanners";
import { LojasEmDestaque } from "@/components/vitrine/LojasEmDestaque";
import { Newsletter } from "@/components/vitrine/Newsletter";
import { SecaoProdutos } from "@/components/vitrine/SecaoProdutos";
import { useCarregar } from "@/hooks/useCarregar";
import { lojasEmDestaque, maisVendidos, novidades, ofertas } from "@/lib/vitrine";
import { produtoService } from "@/services/produtoService";

const TAMANHO_BUSCA = 50;

export default function HomePage() {
  const { dados, erro, carregando, recarregar } = useCarregar("home-produtos", () =>
    produtoService.listar(0, TAMANHO_BUSCA),
  );
  const produtos = dados?.content ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      <CarrosselBanners />

      <AtalhosCategorias />

      {erro ? (
        <div className="space-y-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">{erro}</p>
          <Button variant="outline" onClick={recarregar}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          <SecaoProdutos titulo="Ofertas" produtos={ofertas(produtos)} carregando={carregando} />
          <SecaoProdutos
            titulo="Mais vendidos"
            produtos={maisVendidos(produtos)}
            carregando={carregando}
          />
          <SecaoProdutos titulo="Novidades" produtos={novidades(produtos)} carregando={carregando} />
          <LojasEmDestaque lojas={lojasEmDestaque(produtos)} carregando={carregando} />
        </>
      )}

      <Newsletter />
    </div>
  );
}
