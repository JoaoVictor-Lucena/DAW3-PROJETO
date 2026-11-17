"use client";

import * as React from "react";
import { EyeIcon } from "lucide-react";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { PedidoDetalheDialog } from "@/components/admin/PedidoDetalheDialog";
import { SelectFiltro } from "@/components/admin/SelectFiltro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCarregar } from "@/hooks/useCarregar";
import { ETAPA_PEDIDO_LABEL, rotulo, STATUS_PEDIDO_LABEL } from "@/lib/admin-labels";
import { formatBRL, formatDateTime } from "@/lib/format";
import { adminService } from "@/services/adminService";
import type { Pedido, StatusPedido } from "@/types";

const OPCOES_STATUS = [
  { value: "", label: "Todos os status" },
  ...(Object.entries(STATUS_PEDIDO_LABEL) as [StatusPedido, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

const VARIANTE_STATUS: Record<StatusPedido, "default" | "secondary" | "destructive" | "outline"> = {
  CRIADO: "outline",
  CONFIRMADO: "secondary",
  CANCELADO: "destructive",
  DEVOLVIDO: "outline",
};

export default function AdminPedidosPage() {
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [detalhe, setDetalhe] = React.useState<Pedido | null>(null);

  const filtros = { status: (status || undefined) as StatusPedido | undefined, page };
  const { dados, erro, carregando, recarregar } = useCarregar(JSON.stringify(filtros), () =>
    adminService.pedidos(filtros),
  );

  const pedidos = dados?.content ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo="Pedidos"
        descricao="Todos os pedidos do marketplace, de todas as lojas."
        acoes={
          <SelectFiltro
            opcoes={OPCOES_STATUS}
            value={status}
            ariaLabel="Status do pedido"
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
        mensagemVazia="Nenhum pedido encontrado."
        onTentarDeNovo={recarregar}
      >
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                <TableHead className="hidden lg:table-cell">Lojas</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Detalhe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    #{p.id}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {formatDateTime(p.dataPedido)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{p.nomeCliente}</TableCell>
                  <TableCell className="hidden max-w-48 truncate lg:table-cell">
                    {[...new Set(p.itens.map((i) => i.nomeVendedor))].join(", ")}
                  </TableCell>
                  <TableCell>{formatBRL(p.valorTotal)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant={VARIANTE_STATUS[p.status]}>
                        {rotulo(STATUS_PEDIDO_LABEL, p.status)}
                      </Badge>
                      {p.etapaAtual && (
                        <span className="text-xs text-muted-foreground">
                          {rotulo(ETAPA_PEDIDO_LABEL, p.etapaAtual)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Ver pedido ${p.id}`}
                      onClick={() => setDetalhe(p)}
                    >
                      <EyeIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </EstadoLista>

      <Paginacao page={dados} disabled={carregando} onChange={setPage} />

      <PedidoDetalheDialog pedido={detalhe} onFechar={() => setDetalhe(null)} />
    </>
  );
}
