"use client";

import * as React from "react";
import {
  DollarSignIcon,
  ReceiptTextIcon,
  TrendingUpIcon,
  UserPlusIcon,
} from "lucide-react";

import { Abas } from "@/components/admin/Abas";
import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCarregar } from "@/hooks/useCarregar";
import { rotulo, STATUS_PEDIDO_LABEL } from "@/lib/admin-labels";
import { formatBRL } from "@/lib/format";
import { adminService } from "@/services/adminService";
import type { PontoSerie, Periodo } from "@/types";

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

/** Gráfico de barras simples em CSS (sem biblioteca); o valor aparece ao passar o mouse. */
function GraficoBarras({
  serie,
  valor,
  formatar,
}: {
  serie: PontoSerie[];
  valor: (p: PontoSerie) => number;
  formatar: (v: number) => string;
}) {
  const maximo = Math.max(...serie.map(valor), 0);
  if (maximo === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Sem dados no período.</p>;
  }
  return (
    <div>
      <div className="flex h-48 items-end gap-1" role="img" aria-label="Gráfico de barras do período">
        {serie.map((p) => {
          const v = valor(p);
          return (
            <div key={p.periodo} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div
                title={`${p.periodo}: ${formatar(v)}`}
                className="rounded-t bg-primary/80 transition-colors hover:bg-primary"
                style={{ height: `${Math.max((v / maximo) * 100, v > 0 ? 2 : 0)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{serie[0]?.periodo}</span>
        <span>Máx.: {formatar(maximo)}</span>
        <span>{serie[serie.length - 1]?.periodo}</span>
      </div>
    </div>
  );
}

function ListaRanking({
  titulo,
  itens,
}: {
  titulo: string;
  itens: { chave: number; nome: string; detalhe: string; valor: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem vendas no período.</p>
        ) : (
          <ol className="space-y-3">
            {itens.map((item, i) => (
              <li key={item.chave} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  <span className="font-medium">{item.nome}</span>
                  <span className="block text-xs text-muted-foreground">{item.detalhe}</span>
                </span>
                <span className="shrink-0 font-medium">{formatBRL(item.valor)}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminVisaoGeralPage() {
  const [periodo, setPeriodo] = React.useState<Periodo>("30d");
  const { dados, erro, carregando, recarregar } = useCarregar(periodo, () =>
    adminService.dashboard(periodo),
  );

  return (
    <>
      <CabecalhoPagina
        titulo="Visão geral"
        descricao="Indicadores do marketplace no período selecionado."
        acoes={<Abas abas={PERIODOS} ativa={periodo} onChange={setPeriodo} ariaLabel="Período" />}
      />

      {erro ? (
        <div className="space-y-3 rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">{erro}</p>
          <Button variant="outline" onClick={recarregar}>
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
        <div className={carregando ? "space-y-6 opacity-60" : "space-y-6"}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi titulo="GMV (vendas)" valor={formatBRL(dados.gmv)} Icon={DollarSignIcon} />
            <Kpi
              titulo="Pedidos"
              valor={String(dados.totalPedidos)}
              detalhe={Object.entries(dados.pedidosPorStatus)
                .map(([s, n]) => `${rotulo(STATUS_PEDIDO_LABEL, s)}: ${n}`)
                .join(" · ")}
              Icon={ReceiptTextIcon}
            />
            <Kpi titulo="Ticket médio" valor={formatBRL(dados.ticketMedio)} Icon={TrendingUpIcon} />
            <Kpi
              titulo="Novos usuários"
              valor={String(dados.novosUsuarios.total)}
              detalhe={`${dados.novosUsuarios.clientes} clientes · ${dados.novosUsuarios.vendedores} vendedores`}
              Icon={UserPlusIcon}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <GraficoBarras serie={dados.serie} valor={(p) => p.faturamento} formatar={formatBRL} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <GraficoBarras
                  serie={dados.serie}
                  valor={(p) => p.pedidos}
                  formatar={(v) => `${v} pedido(s)`}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ListaRanking
              titulo="Lojas que mais venderam"
              itens={dados.topVendedores.map((v) => ({
                chave: v.idVendedor,
                nome: v.nome,
                detalhe: `${v.pedidos} pedido(s)`,
                valor: v.faturamento,
              }))}
            />
            <ListaRanking
              titulo="Categorias que mais venderam"
              itens={dados.topCategorias.map((c) => ({
                chave: c.idCategoria,
                nome: c.nome,
                detalhe: `${c.quantidadeVendida} unidade(s)`,
                valor: c.faturamento,
              }))}
            />
          </div>
        </div>
      )}
    </>
  );
}
