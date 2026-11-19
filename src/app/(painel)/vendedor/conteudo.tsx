"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  DollarSignIcon,
  PackagePlusIcon,
  ReceiptTextIcon,
  StarIcon,
  TrendingUpIcon,
  Undo2Icon,
} from "lucide-react";

import { Abas } from "@/components/admin/Abas";
import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { MiniaturaProduto } from "@/components/pedidos/MiniaturaProduto";
import { PedidoResumo } from "@/components/pedidos/PedidoResumo";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { aguardaVendedor } from "@/components/vendedor/acoesPedido";
import { EdicaoRapidaDialog, type ProdutoEditavel } from "@/components/vendedor/EdicaoRapidaDialog";
import { GraficoVendas } from "@/components/vendedor/GraficoVendas";
import { useAtualizarAoFocar } from "@/hooks/useAtualizarAoFocar";
import { useCarregar } from "@/hooks/useCarregar";
import { rotulo, STATUS_PEDIDO_LABEL } from "@/lib/admin-labels";
import { formatBRL } from "@/lib/format";
import { painelVendedorService } from "@/services/painelVendedorService";
import type { Periodo } from "@/types";

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "12m", label: "12 meses" },
];

function Kpi({
  titulo,
  valor,
  detalhe,
  Icon,
}: {
  titulo: string;
  valor: string;
  detalhe?: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{valor}</p>
        {detalhe && <p className="text-xs text-muted-foreground">{detalhe}</p>}
      </CardContent>
    </Card>
  );
}

export default function VendedorVisaoGeralPage() {
  const [periodo, setPeriodo] = React.useState<Periodo>("30d");
  const [editando, setEditando] = React.useState<ProdutoEditavel | null>(null);

  const metricas = useCarregar(periodo, () => painelVendedorService.dashboard(periodo));
  // Pendências não dependem do período: pedidos confirmados esperando o vendedor e devoluções a analisar.
  const pendencias = useCarregar("pendencias", async () => {
    const [pedidos, devolucoes] = await Promise.all([
      painelVendedorService.pedidos({ status: "CONFIRMADO", page: 0 }),
      painelVendedorService.devolucoes({ status: "PENDENTE", page: 0 }),
    ]);
    return { pedidos: pedidos.content.filter(aguardaVendedor), devolucoes: devolucoes.totalElements };
  });
  const { recarregar: recarregarMetricas } = metricas;
  const { recarregar: recarregarPendencias } = pendencias;
  const recarregarTudo = React.useCallback(() => {
    recarregarMetricas();
    recarregarPendencias();
  }, [recarregarMetricas, recarregarPendencias]);
  useAtualizarAoFocar(recarregarTudo);

  const dados = metricas.dados;
  const aguardando = pendencias.dados?.pedidos ?? [];
  const devolucoesPendentes = pendencias.dados?.devolucoes ?? 0;

  return (
    <>
      <CabecalhoPagina
        titulo="Visão geral"
        descricao="Vendas, pendências e estoque da sua loja."
        acoes={<Abas abas={PERIODOS} ativa={periodo} onChange={setPeriodo} ariaLabel="Período" />}
      />

      {metricas.erro ? (
        <div className="space-y-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">{metricas.erro}</p>
          <Button variant="outline" onClick={metricas.recarregar}>
            Tentar novamente
          </Button>
        </div>
      ) : !dados ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className={metricas.carregando ? "space-y-6 opacity-60" : "space-y-6"}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi titulo="Faturamento" valor={formatBRL(dados.faturamento)} Icon={DollarSignIcon} />
            <Kpi
              titulo="Pedidos"
              valor={String(dados.totalPedidos)}
              detalhe={
                Object.entries(dados.pedidosPorStatus)
                  .map(([s, n]) => `${rotulo(STATUS_PEDIDO_LABEL, s)}: ${n}`)
                  .join(" · ") || undefined
              }
              Icon={ReceiptTextIcon}
            />
            <Kpi titulo="Ticket médio" valor={formatBRL(dados.ticketMedio)} Icon={TrendingUpIcon} />
            <Kpi
              titulo="Avaliação média"
              valor={dados.mediaAvaliacoes != null ? `${dados.mediaAvaliacoes.toFixed(1)} / 5` : "—"}
              detalhe={`${dados.totalAvaliacoes} ${dados.totalAvaliacoes === 1 ? "avaliação" : "avaliações"}`}
              Icon={StarIcon}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vendas no período</CardTitle>
            </CardHeader>
            <CardContent>
              <GraficoVendas serie={dados.serie} />
            </CardContent>
          </Card>
        </div>
      )}

      {(aguardando.length > 0 || devolucoesPendentes > 0) && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Precisam da sua ação</h2>
            {devolucoesPendentes > 0 && (
              <Link
                href="/vendedor/devolucoes"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Undo2Icon className="size-4" />
                {devolucoesPendentes === 1
                  ? "1 devolução para analisar"
                  : `${devolucoesPendentes} devoluções para analisar`}
              </Link>
            )}
          </div>
          {aguardando.length > 0 && (
            <div className="space-y-2">
              {aguardando.slice(0, 5).map((p) => (
                <PedidoResumo key={p.id} pedido={p} href={`/vendedor/pedidos/${p.id}`} mostrarCliente />
              ))}
              {aguardando.length > 5 && (
                <Link href="/vendedor/pedidos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Ver todos os pedidos <ArrowRightIcon className="size-4" />
                </Link>
              )}
            </div>
          )}
        </section>
      )}

      {dados && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mais vendidos no período</CardTitle>
            </CardHeader>
            <CardContent>
              {dados.topProdutos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem vendas no período.</p>
              ) : (
                <ol className="space-y-3">
                  {dados.topProdutos.map((p, i) => (
                    <li key={p.idProduto} className="flex items-center gap-3 text-sm">
                      <span className="w-4 shrink-0 text-muted-foreground">{i + 1}.</span>
                      <MiniaturaProduto src={p.imagemUrl} className="size-10" />
                      <span className="min-w-0 flex-1">
                        <Link href={`/produtos/${p.idProduto}`} className="block truncate font-medium hover:underline">
                          {p.nome}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {p.quantidadeVendida} {p.quantidadeVendida === 1 ? "unidade" : "unidades"}
                        </span>
                      </span>
                      <span className="shrink-0 font-medium">{formatBRL(p.faturamento)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
                Estoque baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dados.estoqueBaixo.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todos os produtos têm mais de 5 unidades.</p>
              ) : (
                <ul className="space-y-2">
                  {dados.estoqueBaixo.map((p) => (
                    <li key={p.idProduto} className="flex items-center gap-3 text-sm">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.nome}</span>
                        <span className="flex flex-wrap gap-1 pt-0.5">
                          {p.estoque === 0 ? (
                            <Badge variant="destructive">Esgotado</Badge>
                          ) : (
                            <Badge variant="secondary">
                              {p.estoque} {p.estoque === 1 ? "unidade" : "unidades"}
                            </Badge>
                          )}
                          {!p.ativo && <Badge variant="outline">Pausado</Badge>}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditando({ id: p.idProduto, nome: p.nome, estoque: p.estoque })}
                      >
                        Repor
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {dados && dados.topProdutos.length === 0 && dados.estoqueBaixo.length === 0 && (
        <Link href="/produtos/novo" className={buttonVariants({ variant: "outline" })}>
          <PackagePlusIcon className="size-4" /> Cadastrar um produto
        </Link>
      )}

      <EdicaoRapidaDialog produto={editando} onFechar={() => setEditando(null)} onSalvo={metricas.recarregar} />
    </>
  );
}
