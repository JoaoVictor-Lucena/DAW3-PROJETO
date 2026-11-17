"use client";

import * as React from "react";
import { LockIcon, LockOpenIcon, SearchIcon, ShieldPlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Abas } from "@/components/admin/Abas";
import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { NovoAdminDialog } from "@/components/admin/NovoAdminDialog";
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
import { useAuth } from "@/context/AuthContext";
import { useCarregar } from "@/hooks/useCarregar";
import { ROLE_LABEL } from "@/lib/admin-labels";
import { formatDateTime } from "@/lib/format";
import { adminService } from "@/services/adminService";
import type { Role, UsuarioAdmin } from "@/types";

const ABAS = (["CLIENTE", "VENDEDOR", "ADMIN"] as const).map((r) => ({
  value: r,
  label: ROLE_LABEL[r],
}));

const OPCOES_STATUS = [
  { value: "", label: "Todos os status" },
  { value: "true", label: "Ativos" },
  { value: "false", label: "Bloqueados" },
];

export default function AdminUsuariosPage() {
  const { user } = useAuth();
  const [role, setRole] = React.useState<Role>("CLIENTE");
  const [busca, setBusca] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);
  const [novoAdmin, setNovoAdmin] = React.useState(false);

  const filtros = { role, nome, ativo: status === "" ? undefined : status === "true", page };
  const { dados, erro, carregando, recarregar } = useCarregar(JSON.stringify(filtros), () =>
    adminService.usuarios(filtros),
  );

  function trocarAba(next: Role) {
    setRole(next);
    setPage(0);
  }

  function pedirAlteracao(u: UsuarioAdmin) {
    const bloquear = u.ativo;
    setConfirmacao({
      titulo: bloquear ? `Bloquear ${u.nome}?` : `Desbloquear ${u.nome}?`,
      descricao: bloquear
        ? u.role === "VENDEDOR"
          ? "O vendedor não conseguirá mais entrar e os produtos da loja saem da vitrine."
          : "O usuário não conseguirá mais entrar no marketplace."
        : "O usuário volta a poder entrar no marketplace.",
      acao: bloquear ? "Bloquear" : "Desbloquear",
      destrutiva: bloquear,
      executar: async () => {
        await adminService.alterarAtivo(u.id, !bloquear);
        toast.success(bloquear ? `${u.nome} foi bloqueado.` : `${u.nome} foi desbloqueado.`);
        recarregar();
      },
    });
  }

  const usuarios = dados?.content ?? [];

  return (
    <>
      <CabecalhoPagina
        titulo="Usuários"
        descricao="Clientes, vendedores e administradores do marketplace."
        acoes={
          role === "ADMIN" && (
            <Button onClick={() => setNovoAdmin(true)}>
              <ShieldPlusIcon /> Novo admin
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Abas abas={ABAS} ativa={role} onChange={trocarAba} ariaLabel="Perfil" />
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
        vazio={usuarios.length === 0}
        mensagemVazia="Nenhum usuário encontrado com esses filtros."
        onTentarDeNovo={recarregar}
      >
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">E-mail</TableHead>
                <TableHead className="hidden md:table-cell">Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => {
                const souEu = u.id === user?.id || u.email === user?.email;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.nome}
                      {souEu && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                      <span className="block text-xs font-normal text-muted-foreground sm:hidden">
                        {u.email}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{u.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDateTime(u.dataCadastro)}</TableCell>
                    <TableCell>
                      <Badge variant={u.ativo ? "secondary" : "destructive"}>
                        {u.ativo ? "Ativo" : "Bloqueado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={souEu}
                        title={souEu ? "Você não pode bloquear a própria conta" : undefined}
                        onClick={() => pedirAlteracao(u)}
                      >
                        {u.ativo ? <LockIcon /> : <LockOpenIcon />}
                        {u.ativo ? "Bloquear" : "Desbloquear"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </EstadoLista>

      <Paginacao page={dados} disabled={carregando} onChange={setPage} />

      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
      <NovoAdminDialog open={novoAdmin} onOpenChange={setNovoAdmin} onCriado={recarregar} />
    </>
  );
}
