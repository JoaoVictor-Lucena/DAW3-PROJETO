"use client";

import { Loader2Icon } from "lucide-react";

import { METODOS } from "@/components/checkout/PassoPagamento";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatBRL } from "@/lib/format";
import type { Cupom, Endereco, MetodoPagamento } from "@/types";

export function PassoRevisao({
  endereco,
  metodo,
  cupom,
  isLoading,
  onVoltar,
  onFinalizar,
}: {
  endereco: Endereco;
  metodo: MetodoPagamento;
  cupom: Cupom | null;
  isLoading: boolean;
  onVoltar: () => void;
  onFinalizar: () => void;
}) {
  const { carrinho, carregando, erro, recarregar } = useCart();

  const itens = carrinho?.itens ?? [];
  const subtotal = carrinho?.valorTotal ?? 0;
  const desconto = Math.min(cupom?.desconto ?? 0, subtotal);
  const total = Math.max(subtotal - desconto, 0);
  const indisponiveis = itens.some((i) => !i.disponivel);
  const podeFinalizar = !carregando && !erro && itens.length > 0 && !indisponiveis;

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Revise seu pedido</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-lg border p-3 text-sm">
          <p className="font-medium">Entrega</p>
          <p>
            {endereco.logradouro}, {endereco.numero}
            {endereco.complemento && ` - ${endereco.complemento}`}
          </p>
          <p className="text-muted-foreground">
            {endereco.bairro && `${endereco.bairro} · `}
            {endereco.cidade}/{endereco.uf} · CEP {endereco.cep}
          </p>
        </div>
        <div className="space-y-1 rounded-lg border p-3 text-sm">
          <p className="font-medium">Pagamento</p>
          <p>{METODOS.find((m) => m.value === metodo)?.label}</p>
          {cupom && <p className="text-muted-foreground">Cupom {cupom.codigo}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Itens</p>
        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando carrinho...</p>
        ) : erro ? (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{erro}</p>
            <Button type="button" variant="outline" onClick={recarregar}>
              Tentar de novo
            </Button>
          </div>
        ) : itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {itens.map((i) => (
              <li key={i.idProduto} className="flex items-center justify-between gap-3 p-3 text-sm">
                <div>
                  <p className="font-medium">{i.nomeProduto}</p>
                  <p className="text-muted-foreground">
                    {i.quantidade} × {formatBRL(i.precoUnitario)} · {i.nomeVendedor}
                  </p>
                  {!i.disponivel && (
                    <p className="text-destructive">Indisponível: remova este item do carrinho.</p>
                  )}
                </div>
                <span className="font-medium">{formatBRL(i.subtotal)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatBRL(subtotal)}</dd>
        </div>
        {cupom && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <dt>Desconto ({cupom.codigo})</dt>
            <dd>- {formatBRL(desconto)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatBRL(total)}</dd>
        </div>
      </dl>

      <div className="flex justify-between">
        <Button type="button" variant="outline" disabled={isLoading} onClick={onVoltar}>
          Voltar
        </Button>
        <Button type="button" disabled={isLoading || !podeFinalizar} onClick={onFinalizar}>
          {isLoading && <Loader2Icon className="animate-spin" />} Finalizar
        </Button>
      </div>
    </section>
  );
}
