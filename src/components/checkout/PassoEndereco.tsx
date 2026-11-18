"use client";

import * as React from "react";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCep } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import { enderecoService } from "@/services/enderecoService";
import { buscarCep } from "@/services/viaCepService";
import type { Endereco } from "@/types";

const VAZIO = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };
type Form = typeof VAZIO;

export function PassoEndereco({
  selecionado,
  onSelecionar,
  onAvancar,
}: {
  selecionado: number | null;
  onSelecionar: (endereco: Endereco) => void;
  onAvancar: () => void;
}) {
  const [enderecos, setEnderecos] = React.useState<Endereco[]>([]);
  const [carregando, setCarregando] = React.useState(true);
  const [mostrarForm, setMostrarForm] = React.useState(false);
  const [form, setForm] = React.useState<Form>(VAZIO);
  const [buscandoCep, setBuscandoCep] = React.useState(false);
  const [erroCep, setErroCep] = React.useState<string | null>(null);
  const [salvando, setSalvando] = React.useState(false);

  React.useEffect(() => {
    enderecoService
      .getEnderecos()
      .then((lista) => {
        setEnderecos(lista);
        if (lista.length === 0) setMostrarForm(true);
      })
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setCarregando(false));
  }, []);

  function campo(nome: keyof Form, valor: string) {
    setForm((f) => ({ ...f, [nome]: valor }));
  }

  async function aoSairDoCep() {
    if (form.cep.replace(/\D/g, "").length !== 8) return;
    setBuscandoCep(true);
    setErroCep(null);
    try {
      const r = await buscarCep(form.cep);
      setForm((f) => ({
        ...f,
        logradouro: r.logradouro,
        bairro: r.bairro,
        cidade: r.localidade,
        uf: r.uf,
      }));
    } catch (e) {
      setErroCep(getErrorMessage(e));
    } finally {
      setBuscandoCep(false);
    }
  }

  const formValido =
    form.cep.length === 9 && form.logradouro && form.numero && form.cidade && form.uf.length === 2;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!formValido) return;
    setSalvando(true);
    try {
      const criado = await enderecoService.criar({ ...form, complemento: form.complemento || undefined });
      setEnderecos((l) => [...l, criado]);
      if (criado.id !== undefined) onSelecionar(criado);
      setForm(VAZIO);
      setMostrarForm(false);
      toast.success("Endereço cadastrado.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Endereço de entrega</h2>
        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando endereços...</p>
        ) : enderecos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Você ainda não tem endereços cadastrados.</p>
        ) : (
          <div role="radiogroup" aria-label="Endereços" className="grid gap-3 sm:grid-cols-2">
            {enderecos.map((e) => (
              <button
                key={e.id}
                type="button"
                role="radio"
                aria-checked={selecionado === e.id}
                onClick={() => e.id !== undefined && onSelecionar(e)}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted",
                  selecionado === e.id && "border-primary ring-1 ring-primary",
                )}
              >
                <p className="font-medium">
                  {e.logradouro}, {e.numero}
                  {e.complemento && ` - ${e.complemento}`}
                </p>
                <p className="text-muted-foreground">
                  {e.bairro && `${e.bairro} · `}
                  {e.cidade}/{e.uf}
                </p>
                <p className="text-muted-foreground">CEP {e.cep}</p>
              </button>
            ))}
          </div>
        )}
        {!mostrarForm && (
          <Button type="button" variant="outline" onClick={() => setMostrarForm(true)}>
            <PlusIcon /> Novo endereço
          </Button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="space-y-4 rounded-lg border p-4" noValidate>
          <h3 className="font-medium">Novo endereço</h3>
          <div className="grid gap-4 sm:grid-cols-3">
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
              <Input id="end-rua" value={form.logradouro} onChange={(e) => campo("logradouro", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-numero">Número</Label>
              <Input id="end-numero" value={form.numero} onChange={(e) => campo("numero", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="end-comp">Complemento (opcional)</Label>
              <Input id="end-comp" value={form.complemento} onChange={(e) => campo("complemento", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-bairro">Bairro</Label>
              <Input id="end-bairro" value={form.bairro} onChange={(e) => campo("bairro", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-cidade">Cidade</Label>
              <Input id="end-cidade" value={form.cidade} onChange={(e) => campo("cidade", e.target.value)} />
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
          </div>
          <div className="flex justify-end gap-2">
            {enderecos.length > 0 && (
              <Button type="button" variant="outline" disabled={salvando} onClick={() => setMostrarForm(false)}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={!formValido || salvando}>
              {salvando && <Loader2Icon className="animate-spin" />} Salvar endereço
            </Button>
          </div>
        </form>
      )}

      <div className="flex justify-end">
        <Button type="button" disabled={selecionado === null} onClick={onAvancar}>
          Avançar
        </Button>
      </div>
    </section>
  );
}
