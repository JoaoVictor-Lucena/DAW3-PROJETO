"use client";

import * as React from "react";
import Link from "next/link";
import { PauseIcon, PencilIcon, PlayIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { SelectFiltro } from "@/components/admin/SelectFiltro";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { formatBRL } from "@/lib/format";
import { adminService } from "@/services/adminService";
import { getErrorMessage } from "@/services/api";
import { vendedorService } from "@/services/vendedorService";
import type { Produto, Vendedor } from "@/types";

const OPCOES_STATUS = [
  { value: "", label: "Todos os status" },
  { value: "true", label: "Ativos" },
  { value: "false", label: "Pausados" },
];

export default function AdminProdutosPage() {
  const [busca, setBusca] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [loja, setLoja] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [lojas, setLojas] = React.useState<Vendedor[]>([]);
  const [alterando, setAlterando] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelado = false;
    vendedorService
      .listarTodos()
      .then((v) => !cancelado && setLojas(v))
      .catch((e) => !cancelado && toast.error(getErrorMessage(e)));
    return () => {
      cancelado = true;
    };
  }, []);

  const filtros = {
    nome,
    idVendedor: loja ? Number(loja) : undefined,
    ativo: status === "" ? undefined : status === "true",
    page,
  };
  const { dados, erro, carregando, recarregar } = useCarregar(JSON.stringify(filtros), () =>
    adminService.produtos(filtros),
  );

  const opcoesLoja = React.useMemo(
    () => [
      { value: "", label: "Todas as lojas" },
      ...lojas.map((v) => ({ value: String(v.id), label: v.razaoSocial || v.nome })),
    ],
    [lojas],
  );

  async function alternarAtivo(p: Produto) {
    const ativar = p.ativo === false;
    setAlterando(p.id);
    try {
      await adminService.pausarProduto(p.id, ativar);
      toast.success(ativar ? `"${p.nome}" voltou para a vitrine.` : `"${p.nome}" foi pausado.`);
      recarregar();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAlterando(null);
    }
  }

  const produtos = dados?.content ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo="Produtos"
        descricao="Todos os produtos de todas as lojas, inclusive pausados e sem estoque."
      />

      <div className="flex flex-wrap items-center gap-3">
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setNome(busca);
            setPage(0);
          }}
        >
          <Input
            placeholder="Buscar por nome..."
            aria-label="Buscar por nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="min-w-40"
          />
          <Button type="submit" variant="outline" aria-label="Buscar">
            <SearchIcon />
          </Button>
        </form>
        <SelectFiltro
          opcoes={opcoesLoja}
          value={loja}
          ariaLabel="Loja"
          className="w-full sm:w-56"
          onChange={(v) => {
            setLoja(v);
            setPage(0);
          }}
        />
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
        vazio={produtos.length === 0}
        mensagemVazia="Nenhum produto encontrado com esses filtros."
        onTentarDeNovo={recarregar}
      >
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="hidden md:table-cell">Loja</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden sm:table-cell">Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-56 font-medium">
                    <Link href={`/produtos/${p.id}`} className="block truncate hover:underline">
                      {p.nome}
                    </Link>
                    <span className="block text-xs font-normal text-muted-foreground md:hidden">
                      {p.nomeVendedor}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{p.nomeVendedor}</TableCell>
                  <TableCell>{formatBRL(p.preco)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {p.estoque === 0 ? <Badge variant="destructive">Esgotado</Badge> : p.estoque}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.ativo === false ? "outline" : "secondary"}>
                      {p.ativo === false ? "Pausado" : "Ativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={alterando === p.id}
                        onClick={() => void alternarAtivo(p)}
                      >
                        {p.ativo === false ? <PlayIcon /> : <PauseIcon />}
                        {p.ativo === false ? "Reativar" : "Pausar"}
                      </Button>
                      <Link
                        href={`/produtos/${p.id}/editar`}
                        aria-label={`Editar ${p.nome}`}
                        className={buttonVariants({ variant: "ghost", size: "icon" })}
                      >
                        <PencilIcon />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </EstadoLista>

      <Paginacao page={dados} disabled={carregando} onChange={setPage} />
    </>
  );
}
