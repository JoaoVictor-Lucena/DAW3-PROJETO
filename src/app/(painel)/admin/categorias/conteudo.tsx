"use client";

import * as React from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { CategoriaFormDialog } from "@/components/admin/CategoriaFormDialog";
import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Paginacao } from "@/components/admin/Paginacao";
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
import { categoriaService } from "@/services/categoriaService";
import type { Categoria } from "@/types";

export default function AdminCategoriasPage() {
  const [page, setPage] = React.useState(0);
  const [form, setForm] = React.useState<{ categoria: Categoria | null } | null>(null);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);
  const { dados, erro, carregando, recarregar } = useCarregar(String(page), () =>
    categoriaService.listar(page),
  );

  function pedirExclusao(c: Categoria) {
    setConfirmacao({
      titulo: `Excluir a categoria "${c.nome}"?`,
      descricao: "Esta ação não pode ser desfeita. Categorias com produtos não podem ser excluídas.",
      acao: "Excluir",
      destrutiva: true,
      executar: async () => {
        await categoriaService.remover(c.id);
        toast.success(`Categoria "${c.nome}" excluída.`);
        if (dados && dados.content.length <= 1 && page > 0) setPage(page - 1);
        else recarregar();
      },
    });
  }

  const categorias = dados?.content ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo="Categorias"
        descricao="Organize o catálogo do marketplace."
        acoes={
          <Button onClick={() => setForm({ categoria: null })}>
            <PlusIcon /> Nova categoria
          </Button>
        }
      />

      <EstadoLista
        carregando={carregando}
        erro={erro}
        vazio={categorias.length === 0}
        mensagemVazia="Nenhuma categoria cadastrada."
        onTentarDeNovo={recarregar}
      >
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell className="hidden max-w-md truncate text-muted-foreground sm:table-cell">
                    {c.descricao || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${c.nome}`}
                        onClick={() => setForm({ categoria: c })}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Excluir ${c.nome}`}
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

      <CategoriaFormDialog
        aberto={form !== null}
        categoria={form?.categoria ?? null}
        onFechar={() => setForm(null)}
        onSalvo={recarregar}
      />
      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </>
  );
}
