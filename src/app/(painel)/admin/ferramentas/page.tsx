"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DatabaseIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/services/api";
import { notifySeedUpdated, seedService } from "@/services/seedService";

export default function AdminFerramentasPage() {
  const router = useRouter();
  const [populando, setPopulando] = React.useState(false);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);

  async function popular() {
    setPopulando(true);
    try {
      const res = await seedService.popularInfinito();
      toast.success(
        res.modo === "inicial"
          ? "Banco populado com a carga inicial de teste!"
          : `+${res.criados ?? 10} novos produtos adicionados ao catálogo!`,
      );
      notifySeedUpdated();
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPopulando(false);
    }
  }

  function pedirLimpeza() {
    setConfirmacao({
      titulo: "Limpar banco de dados?",
      descricao:
        "Remove produtos, categorias, pedidos e demais dados de teste, mantendo apenas o Admin padrão. Esta ação não pode ser desfeita.",
      acao: "Limpar banco",
      destrutiva: true,
      executar: async () => {
        await seedService.limpar();
        toast.success("Banco de dados limpo com sucesso.");
        notifySeedUpdated();
        router.refresh();
      },
    });
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Ferramentas"
        descricao="Dados de demonstração para testar e apresentar o marketplace."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <DatabaseIcon className="size-5 text-primary" />
            <CardTitle className="text-base">Popular banco (seed)</CardTitle>
            <CardDescription>
              Na primeira vez, cria a carga inicial de teste. Depois, cada clique adiciona mais 10
              produtos ao catálogo.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => void popular()} disabled={populando}>
              {populando ? <Loader2Icon className="animate-spin" /> : <DatabaseIcon />}
              Popular banco
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <Trash2Icon className="size-5 text-destructive" />
            <CardTitle className="text-base">Limpar banco</CardTitle>
            <CardDescription>
              Apaga os dados de teste e deixa só o Admin padrão. Use antes de uma demonstração do zero.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="destructive" onClick={pedirLimpeza} disabled={populando}>
              <Trash2Icon /> Limpar banco
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </>
  );
}
