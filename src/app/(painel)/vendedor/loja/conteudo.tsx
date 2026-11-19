"use client";

import * as React from "react";
import { Loader2Icon, StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Confirmar, type PedidoConfirmacao } from "@/components/admin/Confirmar";
import { EstadoLista } from "@/components/admin/EstadoLista";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCarregar } from "@/hooks/useCarregar";
import { formatDate } from "@/lib/admin-labels";
import { ApiError, getErrorMessage } from "@/services/api";
import { painelVendedorService } from "@/services/painelVendedorService";
import type { PerfilLojaRequest, Vendedor } from "@/types";

const URL_IMAGEM = /^https?:\/\/\S+$/i;
const MAX_DESCRICAO = 500;

type Campo = "nome" | "razaoSocial" | "descricao" | "bannerUrl";
type Erros = Partial<Record<Campo, string>>;

export default function PerfilLojaPage() {
  const { dados, erro, carregando, recarregar } = useCarregar("perfil-loja", () =>
    painelVendedorService.perfil(),
  );

  if (!dados) {
    return (
      <>
        <CabecalhoPagina titulo="Perfil da loja" descricao="Como sua loja aparece para os clientes." />
        <EstadoLista carregando={carregando} erro={erro} vazio onTentarDeNovo={recarregar}>
          {null}
        </EstadoLista>
      </>
    );
  }

  // A key recria o formulário com os dados salvos depois de cada atualização.
  return <Perfil key={JSON.stringify(dados)} vendedor={dados} onAtualizado={recarregar} />;
}

function Perfil({ vendedor, onAtualizado }: { vendedor: Vendedor; onAtualizado: () => void }) {
  const [valores, setValores] = React.useState<Record<Campo, string>>({
    nome: vendedor.nome,
    razaoSocial: vendedor.razaoSocial,
    descricao: vendedor.descricao ?? "",
    bannerUrl: vendedor.bannerUrl ?? "",
  });
  const [erros, setErros] = React.useState<Erros>({});
  const [salvando, setSalvando] = React.useState(false);
  const [capaFalhou, setCapaFalhou] = React.useState<string | null>(null);
  const [confirmacao, setConfirmacao] = React.useState<PedidoConfirmacao | null>(null);

  const mudar = (campo: Campo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValores((v) => ({ ...v, [campo]: e.target.value }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  };

  function validar(): PerfilLojaRequest | null {
    const v = {
      nome: valores.nome.trim(),
      razaoSocial: valores.razaoSocial.trim(),
      descricao: valores.descricao.trim(),
      bannerUrl: valores.bannerUrl.trim(),
    };
    const novos: Erros = {};
    if (!v.nome) novos.nome = "Informe o nome.";
    if (!v.razaoSocial) novos.razaoSocial = "Informe o nome da loja.";
    if (v.bannerUrl && !URL_IMAGEM.test(v.bannerUrl)) {
      novos.bannerUrl = "Informe uma URL que comece com http:// ou https://.";
    }
    setErros(novos);
    // Campos vazios vão como "": o back-end entende como "remover" a descrição e a capa.
    return Object.keys(novos).length ? null : v;
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const dto = validar();
    if (!dto) return;
    setSalvando(true);
    try {
      await painelVendedorService.atualizarPerfil(vendedor.id, dto);
      toast.success("Perfil da loja atualizado.");
      onAtualizado();
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.erros).length) setErros(error.erros as Erros);
      else toast.error(getErrorMessage(error));
    } finally {
      setSalvando(false);
    }
  }

  function alternarLoja() {
    const abrir = vendedor.lojaAberta === false;
    setConfirmacao({
      titulo: abrir ? "Reabrir a loja?" : "Fechar a loja temporariamente?",
      descricao: abrir
        ? "Seus produtos ativos voltam a aparecer na vitrine."
        : "Seus produtos saem da vitrine até você reabrir. Pedidos em andamento continuam normalmente.",
      acao: abrir ? "Reabrir loja" : "Fechar loja",
      destrutiva: !abrir,
      executar: async () => {
        await painelVendedorService.alterarLoja(abrir);
        toast.success(abrir ? "Loja reaberta." : "Loja fechada temporariamente.");
        onAtualizado();
      },
    });
  }

  const previaBanner = URL_IMAGEM.test(valores.bannerUrl.trim()) ? valores.bannerUrl.trim() : null;
  const erroCampo = (campo: Campo) =>
    erros[campo] && (
      <p id={`loja-${campo}-erro`} className="text-xs text-destructive">
        {erros[campo]}
      </p>
    );
  const aria = (campo: Campo) => ({
    "aria-invalid": !!erros[campo],
    "aria-describedby": erros[campo] ? `loja-${campo}-erro` : undefined,
  });

  return (
    <>
      <CabecalhoPagina titulo="Perfil da loja" descricao="Como sua loja aparece para os clientes." />

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <StoreIcon className="size-5 text-primary" /> Situação da loja
              <Badge variant={vendedor.lojaAberta === false ? "outline" : "secondary"}>
                {vendedor.lojaAberta === false ? "Fechada" : "Aberta"}
              </Badge>
            </CardTitle>
            <CardDescription>
              {vendedor.lojaAberta === false
                ? "Seus produtos não aparecem na vitrine enquanto a loja estiver fechada."
                : "Seus produtos ativos aparecem na vitrine."}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={alternarLoja}>
            {vendedor.lojaAberta === false ? "Reabrir loja" : "Fechar temporariamente"}
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados da loja</CardTitle>
          <CardDescription>
            {vendedor.cnpjCpf} · {vendedor.email}
            {vendedor.dataCadastro && ` · vendendo desde ${formatDate(vendedor.dataCadastro)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={salvar} className="space-y-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="loja-razaoSocial">Nome da loja (razão social)</Label>
                <Input
                  id="loja-razaoSocial"
                  maxLength={150}
                  value={valores.razaoSocial}
                  onChange={mudar("razaoSocial")}
                  {...aria("razaoSocial")}
                />
                {erroCampo("razaoSocial")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loja-nome">Responsável</Label>
                <Input
                  id="loja-nome"
                  maxLength={100}
                  value={valores.nome}
                  onChange={mudar("nome")}
                  {...aria("nome")}
                />
                {erroCampo("nome")}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loja-descricao">
                Descrição <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="loja-descricao"
                rows={4}
                maxLength={MAX_DESCRICAO}
                placeholder="Conte o que sua loja vende e o que a torna especial."
                value={valores.descricao}
                onChange={mudar("descricao")}
                {...aria("descricao")}
              />
              <div className="flex justify-between gap-2 text-xs">
                <span>{erroCampo("descricao")}</span>
                <span className="text-muted-foreground">
                  {valores.descricao.length}/{MAX_DESCRICAO}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loja-bannerUrl">
                Imagem de capa <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="loja-bannerUrl"
                type="url"
                inputMode="url"
                placeholder="https://..."
                maxLength={500}
                value={valores.bannerUrl}
                onChange={mudar("bannerUrl")}
                {...aria("bannerUrl")}
              />
              {erroCampo("bannerUrl")}
              {previaBanner &&
                (capaFalhou === previaBanner ? (
                  <p className="text-xs text-muted-foreground">
                    Não foi possível carregar a imagem deste link para a prévia.
                  </p>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previaBanner}
                    alt="Prévia da capa da loja"
                    className="mt-2 aspect-[4/1] w-full rounded-md border bg-muted object-cover"
                    onError={() => setCapaFalhou(previaBanner)}
                  />
                ))}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={salvando}>
                {salvando && <Loader2Icon className="animate-spin" />}
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Confirmar pedido={confirmacao} onFechar={() => setConfirmacao(null)} />
    </>
  );
}
