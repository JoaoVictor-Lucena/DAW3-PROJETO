"use client";

import * as React from "react";
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { CupomFormDialog } from "@/components/admin/CupomFormDialog";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { SelectFiltro } from "@/components/admin/SelectFiltro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCarregar } from "@/hooks/useCarregar";
import { formatDate } from "@/lib/admin-labels";
import { formatBRL } from "@/lib/format";
import { adminService } from "@/services/adminService";
import type { Cupom, StatusCupom } from "@/types";

const OPCOES_STATUS = [
  { value: "", label: "Todos os status" },
  { value: "ATIVO", label: "Ativos" },
  { value: "INATIVO", label: "Inativos" },
];

function expirado(c: Cupom) {
  if (!c.dataExpiracao) return false;
  const hoje = new Date();
  const hojeISO = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return c.dataExpiracao < hojeISO;
}

export default function AdminCuponsPage() {
  const [busca, setBusca] = React.useState("");
  const [codigo, setCodigo] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [form, setForm] = React.useState<{ cupom: Cupom | null } | null>(null);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);

  const filtros = { codigo, status: (status || undefined) as StatusCupom | undefined, page };
  const { dados, erro, carregando, recarregar } = useCarregar(JSON.stringify(filtros), () =>
    adminService.cupons(filtros),
  );

  function pedirExclusao(c: Cupom) {
    setConfirmacao({
      titulo: `Excluir o cupom ${c.codigo}?`,
      descricao: "Esta ação não pode ser desfeita. Para só impedir novos usos, deixe o cupom inativo.",
      acao: "Excluir",
      destrutiva: true,
      executar: async () => {
        await adminService.removerCupom(c.id);
        toast.success(`Cupom ${c.codigo} excluído.`);
        if (dados && dados.content.length <= 1 && page > 0) setPage(page - 1);
        else recarregar();
      },
    });
  }

  const cupons = dados?.content ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo="Cupons"
        descricao="Cupons de desconto (valor fixo em reais) usados no checkout."
        acoes={
          <Button onClick={() => setForm({ cupom: null })}>
            <PlusIcon /> Novo cupom
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setCodigo(busca);
            setPage(0);
          }}
        >
          <Input
            placeholder="Buscar por código..."
            aria-label="Buscar por código"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="min-w-40"
          />
          <Button type="submit" variant="outline" aria-label="Buscar">
            <SearchIcon />
          </Button>
        </form>
        <SelectFiltro
          opcoes={OPCOES_STATUS}
          value={status}
          ariaLabel="Status"
          onChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
        />
      </div>

      <EstadoLista
        carregando={carregando}
        erro={erro}
        vazio={cupons.length === 0}
        mensagemVazia="Nenhum cupom encontrado."
        onTentarDeNovo={recarregar}
      >
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead className="hidden sm:table-cell">Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium">{c.codigo}</TableCell>
                  <TableCell>{formatBRL(c.valorDesconto)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {c.dataExpiracao ? formatDate(c.dataExpiracao) : "Sem validade"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={c.status === "ATIVO" ? "secondary" : "outline"}>
                        {c.status === "ATIVO" ? "Ativo" : "Inativo"}
                      </Badge>
                      {expirado(c) && <Badge variant="destructive">Expirado</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${c.codigo}`}
                        onClick={() => setForm({ cupom: c })}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Excluir ${c.codigo}`}
                        onClick={() => pedirExclusao(c)}
                      >
                        <Trash2Icon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </EstadoLista>

      <Paginacao page={dados} disabled={carregando} onChange={setPage} />

      <CupomFormDialog
        aberto={form !== null}
        cupom={form?.cupom ?? null}
        onFechar={() => setForm(null)}
        onSalvo={recarregar}
      />
      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </>
  );
}
