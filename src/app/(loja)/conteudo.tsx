"use client";

import { Button } from "@/components/ui/button";
import { AtalhosCategorias } from "@/components/vitrine/AtalhosCategorias";
import { CarrosselBanners } from "@/components/vitrine/CarrosselBanners";
import { LojasEmDestaque } from "@/components/vitrine/LojasEmDestaque";
import { Newsletter } from "@/components/vitrine/Newsletter";
import { SecaoProdutos } from "@/components/vitrine/SecaoProdutos";
import { useCarregar } from "@/hooks/useCarregar";
import { produtoService } from "@/services/produtoService";
import { vendedorService } from "@/services/vendedorService";

const LIMITE_PRODUTOS = 12;
const LIMITE_LOJAS = 8;

function carregarVitrine() {
  return Promise.all([
    produtoService.buscar({ sort: "preco,asc", somenteComEstoque: true, size: LIMITE_PRODUTOS }),
    produtoService.maisVendidos(LIMITE_PRODUTOS),
    produtoService.buscar({ sort: "dataCadastro,desc", size: LIMITE_PRODUTOS }),
    vendedorService.destaque(LIMITE_LOJAS),
  ]);
}

export default function HomePage() {
  const { dados, erro, carregando, recarregar } = useCarregar("home-vitrine", carregarVitrine);
  const [paginaOfertas, maisVendidos = [], paginaNovidades, lojas = []] = dados ?? [];

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
          <SecaoProdutos
            titulo="Ofertas"
            produtos={paginaOfertas?.content ?? []}
            carregando={carregando}
          />
          <SecaoProdutos titulo="Mais vendidos" produtos={maisVendidos} carregando={carregando} />
          <SecaoProdutos
            titulo="Novidades"
            produtos={paginaNovidades?.content ?? []}
            carregando={carregando}
          />
          <LojasEmDestaque lojas={lojas} carregando={carregando} />
        </>
      )}

      <Newsletter />
    </div>
  );
}
