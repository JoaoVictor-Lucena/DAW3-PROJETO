"use client";

import * as React from "react";
import Link from "next/link";
import {
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  ZapIcon,
} from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
import { SelectFiltro } from "@/components/admin/SelectFiltro";
import { MiniaturaProduto } from "@/components/pedidos/MiniaturaProduto";
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
import { EdicaoRapidaDialog, type ProdutoEditavel } from "@/components/vendedor/EdicaoRapidaDialog";
import { useCarregar } from "@/hooks/useCarregar";
import { formatBRL } from "@/lib/format";
import { getErrorMessage } from "@/services/api";
import { painelVendedorService } from "@/services/painelVendedorService";
import type { Produto } from "@/types";

const OPCOES_STATUS = [
  { value: "", label: "Todos os status" },
  { value: "true", label: "Ativos" },
  { value: "false", label: "Pausados" },
];

export default function VendedorProdutosPage() {
  const [busca, setBusca] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [alterando, setAlterando] = React.useState<number | null>(null);
  const [editando, setEditando] = React.useState<ProdutoEditavel | null>(null);

  const filtros = { nome, ativo: status === "" ? undefined : status === "true", page };
  const { dados, erro, carregando, recarregar } = useCarregar(JSON.stringify(filtros), () =>
    painelVendedorService.produtos(filtros),
  );

  async function alternarAtivo(p: Produto) {
    const ativar = p.ativo === false;
    setAlterando(p.id);
    try {
      await painelVendedorService.atualizarProduto(p.id, { ativo: ativar });
      toast.success(ativar ? `"${p.nome}" voltou para a vitrine.` : `"${p.nome}" foi pausado.`);
      recarregar();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAlterando(null);
    }
  }

  const produtos = dados?.content ?? [];
  const filtrando = !!nome || status !== "";

  return (
    <>
      <CabecalhoPagina
        titulo="Meus produtos"
        descricao="Só os produtos da sua loja, inclusive pausados e sem estoque."
        acoes={
          <Link href="/produtos/novo" className={buttonVariants()}>
            <PlusIcon /> Novo produto
          </Link>
        }
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
        mensagemVazia={
          filtrando ? "Nenhum produto encontrado com esses filtros." : "Você ainda não cadastrou produtos."
        }
        onTentarDeNovo={recarregar}
      >
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden sm:table-cell">Estoque</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((p) => (
                <TableRow key={p.id} className={p.ativo === false ? "text-muted-foreground" : undefined}>
                  <TableCell className="max-w-40 sm:max-w-64">
                    <div className="flex items-center gap-3">
                      <MiniaturaProduto src={p.imagemUrl ?? null} className="hidden size-10 sm:flex" />
                      <div className="min-w-0">
                        <Link href={`/produtos/${p.id}`} className="block truncate font-medium hover:underline">
                          {p.nome}
                        </Link>
                        <span className="block truncate text-xs text-muted-foreground">
                          {p.nomeCategoria}
                          <span className="sm:hidden"> · {p.estoque} un.</span>
                          {p.ativo === false && <span className="md:hidden"> · pausado</span>}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatBRL(p.preco)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {p.estoque === 0 ? (
                      <Badge variant="destructive">Esgotado</Badge>
                    ) : p.estoque <= 5 ? (
                      <Badge variant="secondary" className="bg-amber-500/15 text-amber-800 dark:text-amber-300">
                        {p.estoque}
                      </Badge>
                    ) : (
                      p.estoque
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={p.ativo === false ? "outline" : "secondary"}>
                      {p.ativo === false ? "Pausado" : "Ativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditando({
                            id: p.id,
                            nome: p.nome,
                            estoque: p.estoque,
                            preco: p.preco,
                            imagemUrl: p.imagemUrl,
                          })
                        }
                      >
                        <ZapIcon /> <span className="hidden lg:inline">Edição rápida</span>
                        <span className="sr-only lg:hidden">Edição rápida de {p.nome}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={alterando === p.id}
                        aria-label={p.ativo === false ? `Reativar ${p.nome}` : `Pausar ${p.nome}`}
                        onClick={() => void alternarAtivo(p)}
                      >
                        {p.ativo === false ? <PlayIcon /> : <PauseIcon />}
                        <span className="hidden lg:inline">{p.ativo === false ? "Reativar" : "Pausar"}</span>
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

      <EdicaoRapidaDialog produto={editando} onFechar={() => setEditando(null)} onSalvo={recarregar} />
    </>
  );
}
