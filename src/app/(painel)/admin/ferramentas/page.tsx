"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DatabaseIcon, Loader2Icon, RotateCcwIcon, Trash2Icon, UsersIcon } from "lucide-react";
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

  function pedirRestauracao() {
    setConfirmacao({
      titulo: "Restaurar a demonstração?",
      descricao:
        "Apaga todos os dados e recria a carga de demonstração: lojas com descrição e banner, produtos com imagem, "
        + "clientes com endereço, pedidos em todas as etapas, avaliações, cupons, favoritos e notificações. "
        + "Esta ação não pode ser desfeita.",
      acao: "Restaurar demonstração",
      destrutiva: true,
      executar: async () => {
        await seedService.resetar();
        toast.success("Demonstração restaurada. Use as contas de demonstração para entrar.");
        notifySeedUpdated();
        router.refresh();
      },
    });
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
        <Card className="md:col-span-2">
          <CardHeader>
            <RotateCcwIcon className="size-5 text-primary" />
            <CardTitle className="text-base">Restaurar demonstração</CardTitle>
            <CardDescription>
              Volta o banco para a carga completa de demonstração, com dados em todos os painéis. Ideal antes
              de gravar o vídeo ou apresentar.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={pedirRestauracao} disabled={populando}>
              <RotateCcwIcon /> Restaurar demonstração
            </Button>
          </CardFooter>
        </Card>

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

      <Card>
        <CardHeader>
          <UsersIcon className="size-5 text-primary" />
          <CardTitle className="text-base">Contas de demonstração</CardTitle>
          <CardDescription>Criadas pela carga de demonstração (os números vão de 1 a 50).</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-1 pr-4 font-medium">Perfil</th>
                <th className="py-1 pr-4 font-medium">E-mail</th>
                <th className="py-1 font-medium">Senha</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr>
                <td className="py-1 pr-4 font-sans">Admin</td>
                <td className="py-1 pr-4">admin@marketplace.com</td>
                <td className="py-1">admin123</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 font-sans">Vendedor (com loja)</td>
                <td className="py-1 pr-4">vendedor1@eletronicos.com … vendedor5@pets.com</td>
                <td className="py-1">senha123</td>
              </tr>
              <tr>
                <td className="py-1 pr-4 font-sans">Cliente</td>
                <td className="py-1 pr-4">cliente1@email.com … cliente50@email.com</td>
                <td className="py-1">senha123</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </>
  );
}
