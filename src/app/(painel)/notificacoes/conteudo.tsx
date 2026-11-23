"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BellOffIcon, CheckCheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Abas } from "@/components/admin/Abas";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { ItemNotificacao } from "@/components/layout/ItemNotificacao";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { Button } from "@/components/ui/button";
import { useNotificacoes } from "@/context/NotificacoesContext";
import { useCarregar } from "@/hooks/useCarregar";
import { getErrorMessage } from "@/services/api";
import { notificacaoService } from "@/services/notificacaoService";
import type { Notificacao } from "@/types";

type Filtro = "todas" | "naoLidas";

const ABAS: { value: Filtro; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "naoLidas", label: "Não lidas" },
];

function ListaNotificacoes() {
  const router = useRouter();
  const { naoLidas, atualizar, versao } = useNotificacoes();
  const [filtro, setFiltro] = React.useState<Filtro>("todas");
  const [page, setPage] = React.useState(0);
  const [marcando, setMarcando] = React.useState(false);

  const { dados, erro, carregando, recarregar } = useCarregar(`${filtro}#${page}#${versao}`, () =>
    notificacaoService.listar(page, filtro === "naoLidas"),
  );

  async function abrir(n: Notificacao) {
    if (!n.lida) {
      try {
        await notificacaoService.marcarComoLida(n.id);
        atualizar();
      } catch {
      }
    }
    if (n.link) router.push(n.link);
  }

  async function marcarTodas() {
    setMarcando(true);
    try {
      await notificacaoService.marcarTodasComoLidas();
      toast.success("Todas as notificações foram marcadas como lidas.");
      atualizar();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setMarcando(false);
    }
  }

  const lista = dados?.content ?? [];

  return (
    <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 outline-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-sm text-muted-foreground">
            Novos pedidos, mudanças de status e devoluções. Atualiza sozinha a cada 30 segundos.
          </p>
        </div>
        <Button variant="outline" disabled={naoLidas === 0 || marcando} onClick={() => void marcarTodas()}>
          {marcando ? <Loader2Icon className="animate-spin" /> : <CheckCheckIcon />}
          Marcar todas como lidas
        </Button>
      </div>

      <Abas
        abas={ABAS}
        ativa={filtro}
        ariaLabel="Filtro"
        onChange={(f) => {
          setFiltro(f);
          setPage(0);
        }}
      />

      {!carregando && !erro && lista.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
          <BellOffIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {filtro === "naoLidas" ? "Nenhuma notificação não lida." : "Você ainda não tem notificações."}
          </p>
        </div>
      ) : (
        <EstadoLista carregando={carregando} erro={erro} vazio={lista.length === 0} onTentarDeNovo={recarregar}>
          <div className="divide-y rounded-lg border p-1">
            {lista.map((n) => (
              <ItemNotificacao key={n.id} notificacao={n} onAbrir={(x) => void abrir(x)} />
            ))}
          </div>
        </EstadoLista>
      )}

      <Paginacao page={dados} disabled={carregando} onChange={setPage} />
    </main>
  );
}

export default function NotificacoesPage() {
  return (
    <RoleGuard allow={["CLIENTE", "VENDEDOR", "ADMIN"]}>
      <ListaNotificacoes />
    </RoleGuard>
  );
}
