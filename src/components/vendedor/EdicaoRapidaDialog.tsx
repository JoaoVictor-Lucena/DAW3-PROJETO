"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { MiniaturaProduto } from "@/components/pedidos/MiniaturaProduto";
import { Button } from "@/components/ui/button";
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
import {
  formatCurrencyInput,
  numberToCurrencyInput,
  parseCurrencyInput,
} from "@/lib/format";
import { ApiError, getErrorMessage } from "@/services/api";
import { painelVendedorService, type ProdutoRapido } from "@/services/painelVendedorService";

/** O que a edição rápida precisa saber do produto. Sem `preco`, só o estoque é editado. */
export interface ProdutoEditavel {
  id: number;
  nome: string;
  estoque: number;
  preco?: number;
  imagemUrl?: string | null;
}

const URL_IMAGEM = /^https?:\/\/\S+$/i;

type Erros = Partial<Record<"preco" | "estoque" | "imagemUrl", string>>;

/** Diálogo para ajustar preço, estoque e imagem sem sair da lista. */
export function EdicaoRapidaDialog({
  produto,
  onFechar,
  onSalvo,
}: {
  produto: ProdutoEditavel | null;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  return (
    <Dialog open={produto !== null} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent>
        {/* A key recria o formulário com os valores de cada produto aberto. */}
        {produto && <Formulario key={produto.id} produto={produto} onFechar={onFechar} onSalvo={onSalvo} />}
      </DialogContent>
    </Dialog>
  );
}

function Formulario({
  produto,
  onFechar,
  onSalvo,
}: {
  produto: ProdutoEditavel;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const comPreco = produto.preco !== undefined;
  const [preco, setPreco] = React.useState(comPreco ? numberToCurrencyInput(produto.preco!) : "");
  const [estoque, setEstoque] = React.useState(String(produto.estoque));
  const [imagemUrl, setImagemUrl] = React.useState(produto.imagemUrl ?? "");
  const [erros, setErros] = React.useState<Erros>({});
  const [salvando, setSalvando] = React.useState(false);

  function validar(): ProdutoRapido | null {
    const novos: Erros = {};
    const dto: ProdutoRapido = {};

    const qtd = Number(estoque.trim());
    if (!estoque.trim() || !Number.isInteger(qtd) || qtd < 0) {
      novos.estoque = "Informe um número inteiro maior ou igual a 0.";
    } else if (qtd !== produto.estoque) {
      dto.estoque = qtd;
    }

    if (comPreco) {
      const valor = parseCurrencyInput(preco);
      if (!Number.isFinite(valor) || valor <= 0) novos.preco = "O preço deve ser maior que zero.";
      else if (valor !== produto.preco) dto.preco = valor;

      const url = imagemUrl.trim();
      if (!URL_IMAGEM.test(url)) novos.imagemUrl = "Informe uma URL que comece com http:// ou https://.";
      else if (url !== (produto.imagemUrl ?? "")) dto.imagemUrl = url;
    }

    setErros(novos);
    return Object.keys(novos).length ? null : dto;
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const dto = validar();
    if (!dto) return;
    if (Object.keys(dto).length === 0) {
      onFechar();
      return;
    }
    setSalvando(true);
    try {
      await painelVendedorService.atualizarProduto(produto.id, dto);
      toast.success(`"${produto.nome}" atualizado.`);
      onSalvo();
      onFechar();
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.erros).length) {
        setErros(error.erros as Erros);
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setSalvando(false);
    }
  }

  const previa = URL_IMAGEM.test(imagemUrl.trim()) ? imagemUrl.trim() : null;
  const erro = (campo: keyof Erros) =>
    erros[campo] && (
      <p id={`rapida-${campo}-erro`} className="text-xs text-destructive">
        {erros[campo]}
      </p>
    );

  return (
    <form onSubmit={salvar} className="space-y-4" noValidate>
      <DialogHeader>
        <DialogTitle>{comPreco ? "Edição rápida" : "Repor estoque"}</DialogTitle>
        <DialogDescription className="truncate">{produto.nome}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        {comPreco && (
          <div className="space-y-1.5">
            <Label htmlFor="rapida-preco">Preço (R$)</Label>
            <Input
              id="rapida-preco"
              inputMode="numeric"
              value={preco}
              aria-invalid={!!erros.preco}
              aria-describedby={erros.preco ? "rapida-preco-erro" : undefined}
              onChange={(e) => setPreco(formatCurrencyInput(e.target.value))}
            />
            {erro("preco")}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="rapida-estoque">Estoque</Label>
          <Input
            id="rapida-estoque"
            inputMode="numeric"
            value={estoque}
            autoFocus={!comPreco}
            aria-invalid={!!erros.estoque}
            aria-describedby={erros.estoque ? "rapida-estoque-erro" : undefined}
            onChange={(e) => setEstoque(e.target.value.replace(/\D/g, ""))}
          />
          {erro("estoque")}
        </div>
      </div>

      {comPreco && (
        <div className="space-y-1.5">
          <Label htmlFor="rapida-imagem">URL da imagem</Label>
          <div className="flex items-start gap-3">
            <MiniaturaProduto src={previa} className="size-14" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Input
                id="rapida-imagem"
                type="url"
                inputMode="url"
                placeholder="https://..."
                value={imagemUrl}
                aria-invalid={!!erros.imagemUrl}
                aria-describedby={erros.imagemUrl ? "rapida-imagemUrl-erro" : undefined}
                onChange={(e) => setImagemUrl(e.target.value)}
              />
              {erro("imagemUrl")}
            </div>
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" disabled={salvando} onClick={onFechar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando && <Loader2Icon className="animate-spin" />}
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
}
