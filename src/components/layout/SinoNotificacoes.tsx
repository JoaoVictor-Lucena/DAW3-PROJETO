"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover } from "@base-ui/react/popover";
import { BellIcon, CheckCheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { ItemNotificacao } from "@/components/layout/ItemNotificacao";
import { Button, buttonVariants } from "@/components/ui/button";
import { useNotificacoes } from "@/context/NotificacoesContext";
import { getErrorMessage } from "@/services/api";
import { notificacaoService } from "@/services/notificacaoService";
import type { Notificacao } from "@/types";

const QUANTIDADE_NO_SINO = 6;

/** Sino do header: badge com as não lidas e um painel com as mais recentes. */
export function SinoNotificacoes() {
  const router = useRouter();
  const { naoLidas, atualizar } = useNotificacoes();
  const [aberto, setAberto] = React.useState(false);
  const [lista, setLista] = React.useState<Notificacao[] | null>(null);
  const [marcandoTodas, setMarcandoTodas] = React.useState(false);

  async function carregar() {
    try {
      const page = await notificacaoService.listar(0);
      setLista(page.content.slice(0, QUANTIDADE_NO_SINO));
    } catch (error) {
      setLista([]);
      toast.error(getErrorMessage(error));
    }
  }

  function trocarAberto(proximo: boolean) {
    setAberto(proximo);
    if (proximo) void carregar();
  }

  async function abrir(n: Notificacao) {
    setAberto(false);
    if (!n.lida) {
      try {
        await notificacaoService.marcarComoLida(n.id);
        atualizar();
      } catch {
        // Marcar como lida não deve impedir a navegação.
      }
    }
    if (n.link) router.push(n.link);
  }

  async function marcarTodas() {
    setMarcandoTodas(true);
    try {
      await notificacaoService.marcarTodasComoLidas();
      setLista((atual) => atual?.map((n) => ({ ...n, lida: true })) ?? null);
      atualizar();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setMarcandoTodas(false);
    }
  }

  const rotulo =
    naoLidas > 0 ? `Notificações: ${naoLidas} não ${naoLidas === 1 ? "lida" : "lidas"}` : "Notificações";

  return (
    <Popover.Root open={aberto} onOpenChange={trocarAberto}>
      <Popover.Trigger
        render={
          <Button variant="outline" size="icon" aria-label={rotulo} title={rotulo} className="relative" />
        }
      >
        <BellIcon />
        {naoLidas > 0 && (
          <span
            aria-hidden
            className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white"
          >
            {naoLidas > 99 ? "99+" : naoLidas}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
          <Popover.Popup className="w-[min(22rem,calc(100vw-2rem))] rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0">
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
              <Popover.Title className="text-sm font-semibold">Notificações</Popover.Title>
              <Button
                variant="ghost"
                size="xs"
                disabled={naoLidas === 0 || marcandoTodas}
                onClick={() => void marcarTodas()}
              >
                {marcandoTodas ? <Loader2Icon className="animate-spin" /> : <CheckCheckIcon />}
                Marcar todas como lidas
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto p-1">
              {lista === null ? (
                <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2Icon className="size-4 animate-spin" /> Carregando...
                </p>
              ) : lista.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Você não tem notificações.
                </p>
              ) : (
                lista.map((n) => <ItemNotificacao key={n.id} notificacao={n} onAbrir={(x) => void abrir(x)} />)
              )}
            </div>

            <div className="border-t p-1">
              <Link
                href="/notificacoes"
                onClick={() => setAberto(false)}
                className={buttonVariants({ variant: "ghost", size: "sm", className: "w-full" })}
              >
                Ver todas
              </Link>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
