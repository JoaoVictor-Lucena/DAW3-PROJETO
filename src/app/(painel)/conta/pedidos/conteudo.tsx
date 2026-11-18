"use client";

import * as React from "react";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { SelectFiltro } from "@/components/admin/SelectFiltro";
import { PedidoResumo } from "@/components/pedidos/PedidoResumo";
import { useAtualizarAoFocar } from "@/hooks/useAtualizarAoFocar";
import { useCarregar } from "@/hooks/useCarregar";
import { pedidoService } from "@/services/pedidoService";
import type { Devolucao, StatusPedido } from "@/types";

const OPCOES_STATUS = [
  { value: "", label: "Todos os pedidos" },
  { value: "CONFIRMADO", label: "Confirmados" },
  { value: "CRIADO", label: "Aguardando confirmação" },
  { value: "CANCELADO", label: "Cancelados" },
  { value: "DEVOLVIDO", label: "Devolvidos" },
];

export default function MeusPedidosPage() {
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(0);

  const filtros = { status: (status || undefined) as StatusPedido | undefined, page };
  const { dados, erro, carregando, recarregar } = useCarregar(JSON.stringify(filtros), async () => {
    const [pagina, devolucoes] = await Promise.all([
      pedidoService.meus(filtros),
      pedidoService.devolucoesPorPedido().catch((): Record<number, Devolucao> => ({})),
    ]);
    return { pagina, devolucoes };
  });
  useAtualizarAoFocar(recarregar);

  const pedidos = dados?.pagina.content ?? [];
  const devolucoes = dados?.devolucoes ?? {};

  return (
    <>
      <CabecalhoPagina
        titulo="Meus pedidos"
        descricao="Cada compra gera um pedido por loja. Toque em um pedido para ver o rastreio."
        acoes={
          <SelectFiltro
            opcoes={OPCOES_STATUS}
            value={status}
            ariaLabel="Filtrar por status"
            onChange={(v) => {
              setStatus(v);
              setPage(0);
            }}
          />
        }
      />

      <EstadoLista
        carregando={carregando}
        erro={erro}
        vazio={pedidos.length === 0}
        mensagemVazia={status ? "Nenhum pedido com este status." : "Você ainda não fez nenhum pedido."}
        onTentarDeNovo={recarregar}
      >
        <div className="space-y-2">
          {pedidos.map((p) => (
            <PedidoResumo key={p.id} pedido={p} devolucao={devolucoes[p.id]} />
          ))}
        </div>
      </EstadoLista>

      <Paginacao page={dados?.pagina} disabled={carregando} onChange={setPage} />
    </>
  );
}
