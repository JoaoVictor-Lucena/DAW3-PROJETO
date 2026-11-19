"use client";

import * as React from "react";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { SelectFiltro } from "@/components/admin/SelectFiltro";
import { PedidoResumo } from "@/components/pedidos/PedidoResumo";
import { Badge } from "@/components/ui/badge";
import { aguardaVendedor } from "@/components/vendedor/acoesPedido";
import { useAtualizarAoFocar } from "@/hooks/useAtualizarAoFocar";
import { useCarregar } from "@/hooks/useCarregar";
import { painelVendedorService } from "@/services/painelVendedorService";
import type { Devolucao, StatusPedido } from "@/types";

const OPCOES_STATUS = [
  { value: "", label: "Todos os pedidos" },
  { value: "CONFIRMADO", label: "Confirmados" },
  { value: "CRIADO", label: "Aguardando pagamento" },
  { value: "CANCELADO", label: "Cancelados" },
  { value: "DEVOLVIDO", label: "Devolvidos" },
];

export default function VendedorPedidosPage() {
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(0);

  const filtros = { status: (status || undefined) as StatusPedido | undefined, page };
  const { dados, erro, carregando, recarregar } = useCarregar(JSON.stringify(filtros), async () => {
    const [pagina, devolucoes] = await Promise.all([
      painelVendedorService.pedidos(filtros),
      painelVendedorService.devolucoesPorPedido().catch((): Record<number, Devolucao> => ({})),
    ]);
    return { pagina, devolucoes };
  });
  useAtualizarAoFocar(recarregar);

  const pedidos = dados?.pagina.content ?? [];
  const devolucoes = dados?.devolucoes ?? {};

  return (
    <>
      <CabecalhoPagina
        titulo="Pedidos recebidos"
        descricao="Pedidos com produtos da sua loja. Abra um pedido para avançar a entrega."
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
        mensagemVazia={status ? "Nenhum pedido com este status." : "Sua loja ainda não recebeu pedidos."}
        onTentarDeNovo={recarregar}
      >
        <div className="space-y-2">
          {pedidos.map((p) => {
            const devolucao = devolucoes[p.id];
            const suaVez = devolucao?.status === "PENDENTE" || (!devolucao && aguardaVendedor(p));
            return (
              <PedidoResumo
                key={p.id}
                pedido={p}
                devolucao={devolucao}
                href={`/vendedor/pedidos/${p.id}`}
                mostrarCliente
                extra={suaVez && <Badge>Sua vez</Badge>}
              />
            );
          })}
        </div>
      </EstadoLista>

      <Paginacao page={dados?.pagina} disabled={carregando} onChange={setPage} />
    </>
  );
}
