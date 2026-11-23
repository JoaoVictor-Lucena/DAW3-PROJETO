"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLinkIcon, StoreIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExcluirLojaDialog } from "@/components/vendedor/ExcluirLojaDialog";
import { LojaFormCard } from "@/components/vendedor/LojaFormCard";
import { useCarregar } from "@/hooks/useCarregar";
import { painelVendedorService } from "@/services/painelVendedorService";

function PerfilLojaSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregando dados da loja">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}

export default function PerfilLojaPage() {
  // GET /vendedores/me devolve sempre a loja do vendedor logado, e o back-end recusa (403)
  // qualquer alteração na loja de outro: não há como abrir a loja de outra pessoa aqui.
  const { dados: vendedor, erro, carregando, recarregar } = useCarregar("perfil-loja", () =>
    painelVendedorService.perfil(),
  );
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);
  const [excluirAberto, setExcluirAberto] = React.useState(false);

  if (!vendedor) {
    return (
      <>
        <CabecalhoPagina
          titulo="Perfil da loja"
          descricao="Gerencie os dados, a disponibilidade e o encerramento da sua loja."
        />
        {erro ? (
          <div className="space-y-3 rounded-lg border border-dashed p-10 text-center">
            <p className="text-muted-foreground">{erro}</p>
            <Button variant="outline" onClick={recarregar}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <PerfilLojaSkeleton />
        )}
      </>
    );
  }

  function alternarLoja() {
    if (!vendedor) return;
    const abrir = vendedor.lojaAberta === false;
    setConfirmacao({
      titulo: abrir ? "Reabrir a loja?" : "Fechar a loja temporariamente?",
      descricao: abrir
        ? "Seus produtos ativos voltam a aparecer na vitrine."
        : "Seus produtos saem da vitrine até você reabrir. Pedidos em andamento continuam normalmente.",
      acao: abrir ? "Reabrir loja" : "Fechar loja",
      destrutiva: !abrir,
      executar: async () => {
        await painelVendedorService.alterarLoja(abrir);
        toast.success(abrir ? "Loja reaberta." : "Loja fechada temporariamente.");
        recarregar();
      },
    });
  }

  const contaInativa = vendedor.ativo === false;
  const lojaFechada = vendedor.lojaAberta === false;

  return (
    <>
      <CabecalhoPagina
        titulo="Perfil da loja"
        descricao="Gerencie os dados, a disponibilidade e o encerramento da sua loja."
        acoes={
          <Link
            href={`/loja/${vendedor.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ExternalLinkIcon className="size-4" />
            Ver página pública da loja
          </Link>
        }
      />

      <div aria-busy={carregando} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex flex-wrap items-center gap-2">
                <StoreIcon className="size-5 text-primary" /> Situação da loja
                <Badge variant={lojaFechada ? "outline" : "secondary"}>
                  {lojaFechada ? "Fechada" : "Aberta"}
                </Badge>
                <Badge variant={contaInativa ? "destructive" : "secondary"}>
                  {contaInativa ? "Conta inativa" : "Conta ativa"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {contaInativa
                  ? "Sua conta está inativa e seus produtos não aparecem na vitrine."
                  : lojaFechada
                    ? "Seus produtos não aparecem na vitrine enquanto a loja estiver fechada."
                    : "Seus produtos ativos aparecem normalmente na vitrine."}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={alternarLoja} disabled={contaInativa}>
              {lojaFechada ? "Reabrir loja" : "Fechar temporariamente"}
            </Button>
          </CardHeader>
        </Card>

        <LojaFormCard
          key={vendedor.id}
          vendedor={vendedor}
          onAtualizado={recarregar}
        />

        <Card className="border-destructive/40">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-destructive">Excluir conta e loja</CardTitle>
              <CardDescription>
                Encerra sua conta de vendedor de forma definitiva. A operação é bloqueada se houver
                pedidos em andamento; caso haja histórico, a loja é anonimizada e os produtos são
                pausados.
              </CardDescription>
            </div>
            <Button variant="destructive" onClick={() => setExcluirAberto(true)}>
              <Trash2Icon className="size-4" />
              Excluir loja definitivamente
            </Button>
          </CardHeader>
        </Card>
      </div>

      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
      <ExcluirLojaDialog
        open={excluirAberto}
        nomeLoja={vendedor.razaoSocial || vendedor.nome}
        onOpenChange={setExcluirAberto}
      />
    </>
  );
}
