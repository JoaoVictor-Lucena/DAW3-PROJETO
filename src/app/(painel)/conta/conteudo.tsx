"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  HeartIcon,
  PackageIcon,
  ShoppingBagIcon,
  TruckIcon,
} from "lucide-react";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { etapaDoPedido } from "@/components/pedidos/EtapaBadge";
import { PedidoResumo } from "@/components/pedidos/PedidoResumo";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useAtualizarAoFocar } from "@/hooks/useAtualizarAoFocar";
import { useCarregar } from "@/hooks/useCarregar";
import { pedidoService } from "@/services/pedidoService";
import type { Devolucao, EtapaPedido, Pedido } from "@/types";

/** Etapas em que o pedido já terminou (não está mais "em andamento"). */
const FINALIZADAS: readonly EtapaPedido[] = [
  "ENTREGUE",
  "CANCELADO",
  "PAGAMENTO_RECUSADO",
  "DEVOLUCAO_SOLICITADA",
  "DEVOLUCAO_RECUSADA",
  "DEVOLVIDO",
];

const ATALHOS = [
  { href: "/conta/pedidos", titulo: "Meus pedidos", descricao: "Status, rastreio e histórico.", Icon: PackageIcon },
  { href: "/conta/favoritos", titulo: "Lista de desejos", descricao: "Produtos salvos para depois.", Icon: HeartIcon },
  { href: "/produtos", titulo: "Continuar comprando", descricao: "Navegue pelo catálogo.", Icon: ShoppingBagIcon },
] as const;

function Indicador({ rotulo, valor }: { rotulo: string; valor: number | undefined }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{rotulo}</CardDescription>
        <CardTitle className="text-2xl font-bold">{valor ?? "—"}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function ContaPage() {
  const { user } = useAuth();
  // A primeira página já traz os pedidos mais recentes; os em andamento estão sempre entre eles.
  const { dados, erro, carregando, recarregar } = useCarregar("recentes", async () => {
    const [pagina, devolucoes] = await Promise.all([
      pedidoService.meus({ page: 0 }),
      pedidoService.devolucoesPorPedido().catch((): Record<number, Devolucao> => ({})),
    ]);
    return { pagina, devolucoes };
  });
  useAtualizarAoFocar(recarregar);

  const pedidos = dados?.pagina.content ?? [];
  const devolucoes = dados?.devolucoes ?? {};
  const etapa = (p: Pedido) => etapaDoPedido(p, devolucoes[p.id]);
  const emAndamento = pedidos.filter((p) => !FINALIZADAS.includes(etapa(p)));
  const entregues = pedidos.filter((p) => etapa(p) === "ENTREGUE");
  const recentes = pedidos.slice(0, 5);
  const primeiroNome = user?.nome?.split(" ")[0];

  return (
    <>
      <CabecalhoPagina
        titulo={primeiroNome ? `Olá, ${primeiroNome}!` : "Minha conta"}
        descricao="Acompanhe suas compras e acesse seus atalhos."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador rotulo="Pedidos realizados" valor={dados?.pagina.totalElements} />
        <Indicador rotulo="Em andamento" valor={dados && emAndamento.length} />
        <Indicador rotulo="Entregues recentemente" valor={dados && entregues.length} />
      </div>

      {emAndamento.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <TruckIcon className="size-5 text-primary" /> Em andamento
          </h2>
          <div className="space-y-2">
            {emAndamento.map((p) => (
              <PedidoResumo key={p.id} pedido={p} devolucao={devolucoes[p.id]} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Pedidos recentes</h2>
          {pedidos.length > 0 && (
            <Link href="/conta/pedidos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Ver todos <ArrowRightIcon className="size-4" />
            </Link>
          )}
        </div>
        <EstadoLista
          carregando={carregando}
          erro={erro}
          vazio={recentes.length === 0}
          mensagemVazia="Você ainda não fez nenhum pedido."
          onTentarDeNovo={recarregar}
        >
          <div className="space-y-2">
            {recentes.map((p) => (
              <PedidoResumo key={p.id} pedido={p} devolucao={devolucoes[p.id]} />
            ))}
          </div>
        </EstadoLista>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Atalhos</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {ATALHOS.map(({ href, titulo, descricao, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardContent className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{titulo}</p>
                    <p className="text-sm text-muted-foreground">{descricao}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
