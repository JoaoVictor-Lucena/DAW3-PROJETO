"use client";

import * as React from "react";
import { Loader2Icon, MapPinIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCarregar } from "@/hooks/useCarregar";
import { formatCep } from "@/lib/format";
import { getErrorMessage } from "@/services/api";
import { enderecoService } from "@/services/enderecoService";
import { buscarCep } from "@/services/viaCepService";
import type { Endereco } from "@/types";

const VAZIO = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };
type Form = typeof VAZIO;

function EnderecoForm({
  endereco,
  onFechar,
  onSalvo,
}: {
  endereco: Endereco | null;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const [form, setForm] = React.useState<Form>(() =>
    endereco
      ? {
          cep: formatCep(endereco.cep),
          logradouro: endereco.logradouro,
          numero: endereco.numero,
          complemento: endereco.complemento ?? "",
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          uf: endereco.uf,
        }
      : VAZIO,
  );
  const [buscandoCep, setBuscandoCep] = React.useState(false);
  const [erroCep, setErroCep] = React.useState<string | null>(null);
  const [salvando, setSalvando] = React.useState(false);

  function campo(nome: keyof Form, valor: string) {
    setForm((f) => ({ ...f, [nome]: valor }));
  }

  async function aoSairDoCep() {
    if (form.cep.replace(/\D/g, "").length !== 8) return;
    setBuscandoCep(true);
    setErroCep(null);
    try {
      const r = await buscarCep(form.cep);
      setForm((f) => ({ ...f, logradouro: r.logradouro, bairro: r.bairro, cidade: r.localidade, uf: r.uf }));
    } catch (e) {
      setErroCep(getErrorMessage(e));
    } finally {
      setBuscandoCep(false);
    }
  }

  const formValido =
    form.cep.length === 9 && form.logradouro.trim() && form.numero.trim() && form.cidade.trim() && form.uf.length === 2;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!formValido) return;
    setSalvando(true);
    try {
      const dados = { ...form, complemento: form.complemento || undefined };
      if (endereco?.id !== undefined) {
        await enderecoService.atualizar(endereco.id, dados);
        toast.success("Endereço atualizado.");
      } else {
        await enderecoService.criar(dados);
        toast.success("Endereço cadastrado.");
      }
      onSalvo();
      onFechar();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <form id="form-endereco" onSubmit={salvar} className="grid gap-4 sm:grid-cols-3" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="end-cep">CEP</Label>
          <div className="relative">
            <Input
              id="end-cep"
              inputMode="numeric"
              placeholder="00000-000"
              value={form.cep}
              aria-invalid={!!erroCep}
              onChange={(e) => campo("cep", formatCep(e.target.value))}
              onBlur={aoSairDoCep}
            />
            {buscandoCep && (
              <Loader2Icon className="absolute top-2.5 right-2.5 size-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {erroCep && <p className="text-sm text-destructive">{erroCep}</p>}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="end-rua">Rua</Label>
          <Input id="end-rua" maxLength={100} value={form.logradouro} onChange={(e) => campo("logradouro", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-numero">Número</Label>
          <Input id="end-numero" maxLength={10} value={form.numero} onChange={(e) => campo("numero", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="end-comp">Complemento (opcional)</Label>
          <Input id="end-comp" maxLength={50} value={form.complemento} onChange={(e) => campo("complemento", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-bairro">Bairro</Label>
          <Input id="end-bairro" value={form.bairro} onChange={(e) => campo("bairro", e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="end-cidade">Cidade</Label>
          <Input id="end-cidade" maxLength={50} value={form.cidade} onChange={(e) => campo("cidade", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-uf">UF</Label>
          <Input
            id="end-uf"
            maxLength={2}
            className="uppercase"
            value={form.uf}
            onChange={(e) => campo("uf", e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase())}
          />
        </div>
      </form>
      <DialogFooter>
        <Button type="button" variant="outline" disabled={salvando} onClick={onFechar}>
          Cancelar
        </Button>
        <Button type="submit" form="form-endereco" disabled={!formValido || salvando}>
          {salvando && <Loader2Icon className="animate-spin" />}
          {endereco ? "Salvar alterações" : "Salvar endereço"}
        </Button>
      </DialogFooter>
    </>
  );
}

function EnderecoDialog({
  aberto,
  endereco,
  onFechar,
  onSalvo,
}: {
  aberto: boolean;
  /** Endereço em edição; `null` cria um novo. */
  endereco: Endereco | null;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{endereco ? "Editar endereço" : "Novo endereço"}</DialogTitle>
          <DialogDescription>Informe o CEP para preencher rua, bairro, cidade e UF automaticamente.</DialogDescription>
        </DialogHeader>
        {aberto && (
          <EnderecoForm
            key={endereco?.id || "novo"}
            endereco={endereco}
            onFechar={onFechar}
            onSalvo={onSalvo}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function EnderecosPage() {
  const { dados, erro, carregando, recarregar } = useCarregar("enderecos", () => enderecoService.getEnderecos());
  const [dialogAberto, setDialogAberto] = React.useState(false);
  const [emEdicao, setEmEdicao] = React.useState<Endereco | null>(null);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);

  function abrirNovo() {
    setEmEdicao(null);
    setDialogAberto(true);
  }

  function abrirEdicao(e: Endereco) {
    setEmEdicao(e);
    setDialogAberto(true);
  }

  function pedirExclusao(e: Endereco) {
    if (e.id === undefined) return;
    const id = e.id;
    setConfirmacao({
      titulo: "Excluir endereço?",
      descricao: `${e.logradouro}, ${e.numero} - ${e.cidade}/${e.uf} será removido da sua conta.`,
      acao: "Excluir",
      destrutiva: true,
      executar: async () => {
        await enderecoService.excluir(id);
        toast.success("Endereço excluído.");
        recarregar();
      },
    });
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Meus endereços"
        descricao="Endereços usados nas suas entregas."
        acoes={
          <Button type="button" onClick={abrirNovo}>
            <PlusIcon /> Novo Endereço
          </Button>
        }
      />

      <EstadoLista
        carregando={carregando}
        erro={erro}
        vazio={!dados || dados.length === 0}
        mensagemVazia="Você ainda não tem endereços cadastrados."
        onTentarDeNovo={recarregar}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {dados?.map((e) => (
            <Card key={e.id}>
              <CardContent className="flex items-start justify-between gap-3">
                <div className="flex gap-3 text-sm">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">
                      {e.logradouro}, {e.numero}
                      {e.complemento && ` - ${e.complemento}`}
                    </p>
                    <p className="text-muted-foreground">
                      {e.cidade}/{e.uf}
                    </p>
                    <p className="text-muted-foreground">CEP {formatCep(e.cep)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Editar endereço" onClick={() => abrirEdicao(e)}>
                    <PencilIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Excluir endereço"
                    className="text-destructive"
                    onClick={() => pedirExclusao(e)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </EstadoLista>

      <EnderecoDialog
        aberto={dialogAberto}
        endereco={emEdicao}
        onFechar={() => setDialogAberto(false)}
        onSalvo={recarregar}
      />
      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </>
  );
}
