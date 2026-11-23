"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, MessageSquareIcon, StarIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Paginacao } from "@/components/admin/Paginacao";
import { Estrelas } from "@/components/produtos/Estrelas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { applyApiFieldErrors } from "@/lib/form-errors";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ApiError, getErrorMessage } from "@/services/api";
import { avaliacaoService } from "@/services/avaliacaoService";
import type { Avaliacao, AvaliacaoResumo, Page, PodeAvaliar } from "@/types";

const MAX_COMENTARIO = 350;
const NOTAS_HISTOGRAMA = [5, 4, 3, 2, 1] as const;

const avaliacaoSchema = z.object({
  nota: z
    .number()
    .int("Escolha uma nota de 1 a 5 estrelas.")
    .min(1, "Escolha uma nota de 1 a 5 estrelas.")
    .max(5, "A nota máxima é 5 estrelas."),
  comentario: z
    .string()
    .trim()
    .max(MAX_COMENTARIO, `Máximo de ${MAX_COMENTARIO} caracteres.`),
});

type AvaliacaoFormValues = z.infer<typeof avaliacaoSchema>;

const FIELDS = ["nota", "comentario"] as const;

function EstrelasFixas({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Nota ${nota} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-4",
            i < nota ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

interface FormularioAvaliacaoInlineProps {
  idProduto: number;
  onCriada: () => void;
}

function FormularioAvaliacaoInline({ idProduto, onCriada }: FormularioAvaliacaoInlineProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AvaliacaoFormValues>({
    resolver: zodResolver(avaliacaoSchema),
    defaultValues: {
      nota: 0,
      comentario: "",
    },
  });

  const notaAtual = useWatch({ control, name: "nota" }) ?? 0;
  const comentarioAtual = useWatch({ control, name: "comentario" }) ?? "";
  const tamanhoComentario = comentarioAtual.trim().length;

  async function onSubmit(values: AvaliacaoFormValues) {
    try {
      await avaliacaoService.criar({
        idProduto,
        nota: values.nota,
        comentario: values.comentario.trim() || undefined,
      });
      toast.success("Obrigado pela avaliação!");
      reset({ nota: 0, comentario: "" });
      onCriada();
    } catch (error) {
      const mapped =
        error instanceof ApiError &&
        error.status === 400 &&
        applyApiFieldErrors(error, setError, FIELDS);
      if (!mapped) toast.error(getErrorMessage(error));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Avaliar este produto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <fieldset className="space-y-1.5" disabled={isSubmitting}>
            <legend className="text-sm font-medium">Nota</legend>
            <div className="flex gap-1" role="radiogroup" aria-label="Nota de 1 a 5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={notaAtual === n}
                  aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
                  className="rounded-md p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  onClick={() => {
                    setValue("nota", n, { shouldValidate: true });
                    clearErrors("nota");
                  }}
                >
                  <StarIcon
                    className={cn(
                      "size-7",
                      n <= notaAtual
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground",
                    )}
                  />
                </button>
              ))}
            </div>
            {errors.nota && (
              <p className="text-xs text-destructive">{errors.nota.message}</p>
            )}
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="avaliacao-comentario">
              Comentário <span className="font-normal text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="avaliacao-comentario"
              rows={3}
              placeholder="Conte o que achou do produto."
              disabled={isSubmitting}
              aria-invalid={!!errors.comentario}
              aria-describedby={errors.comentario ? "avaliacao-comentario-erro" : undefined}
              {...register("comentario")}
            />
            <div className="flex justify-between gap-2 text-xs">
              <span>
                {errors.comentario && (
                  <span id="avaliacao-comentario-erro" className="text-destructive">
                    {errors.comentario.message}
                  </span>
                )}
              </span>
              <span
                className={
                  tamanhoComentario > MAX_COMENTARIO
                    ? "text-destructive"
                    : "text-muted-foreground"
                }
              >
                {tamanhoComentario}/{MAX_COMENTARIO}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Enviar avaliação
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface SecaoAvaliacoesProdutoProps {
  idProduto: number;
  onResumoAtualizado?: (resumo: AvaliacaoResumo) => void;
}

type ResumoEstado = { chave: string; dados?: AvaliacaoResumo; falhou?: boolean };
type ListaEstado = { chave: string; page?: Page<Avaliacao>; erro?: string };
type PodeEstado = { chave: string; dados?: PodeAvaliar; falhou?: boolean };

export function SecaoAvaliacoesProduto({
  idProduto,
  onResumoAtualizado,
}: SecaoAvaliacoesProdutoProps) {
  const { user, ready } = useAuth();
  const { openLoginModal } = useModal();

  const [pagina, setPagina] = React.useState(0);
  const [versao, setVersao] = React.useState(0);

  const [resumoEstado, setResumoEstado] = React.useState<ResumoEstado | null>(null);
  const [listaEstado, setListaEstado] = React.useState<ListaEstado | null>(null);
  const [podeEstado, setPodeEstado] = React.useState<PodeEstado | null>(null);

  const notificarResumo = React.useEffectEvent((resumo: AvaliacaoResumo) => {
    onResumoAtualizado?.(resumo);
  });

  const chaveResumo = `${idProduto}#${versao}`;
  React.useEffect(() => {
    let cancelado = false;
    avaliacaoService
      .resumo(idProduto)
      .then((dados) => {
        if (cancelado) return;
        setResumoEstado({ chave: chaveResumo, dados });
        notificarResumo(dados);
      })
      .catch(() => {
        if (!cancelado) setResumoEstado({ chave: chaveResumo, falhou: true });
      });
    return () => {
      cancelado = true;
    };
  }, [idProduto, chaveResumo]);

  const chaveLista = `${idProduto}#${pagina}#${versao}`;
  React.useEffect(() => {
    let cancelado = false;
    avaliacaoService
      .listarPorProdutoPaginado(idProduto, pagina)
      .then((page) => {
        if (!cancelado) setListaEstado({ chave: chaveLista, page });
      })
      .catch((error) => {
        if (!cancelado) {
          setListaEstado({ chave: chaveLista, erro: getErrorMessage(error) });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [idProduto, pagina, chaveLista]);

  const ehCliente = ready && user?.role === "CLIENTE";
  const chavePode = `${idProduto}#${user?.id ?? user?.email ?? ""}#${versao}`;
  React.useEffect(() => {
    if (!ehCliente) return;
    let cancelado = false;
    avaliacaoService
      .podeAvaliar(idProduto)
      .then((dados) => {
        if (!cancelado) setPodeEstado({ chave: chavePode, dados });
      })
      .catch(() => {
        if (!cancelado) setPodeEstado({ chave: chavePode, falhou: true });
      });
    return () => {
      cancelado = true;
    };
  }, [ehCliente, idProduto, chavePode]);

  const carregandoResumo = resumoEstado?.chave !== chaveResumo;
  const resumo = !carregandoResumo ? resumoEstado.dados : undefined;

  const carregandoLista = listaEstado?.chave !== chaveLista;
  const page = !carregandoLista ? listaEstado.page : undefined;
  const erroLista = !carregandoLista ? listaEstado.erro : undefined;

  const carregandoPode = ehCliente && podeEstado?.chave !== chavePode;
  const podeAvaliarDados = ehCliente && !carregandoPode ? podeEstado?.dados : undefined;

  function handleAvaliacaoCriada() {
    setPagina(0);
    setVersao((v) => v + 1);
  }

  return (
    <section className="space-y-6" aria-label="Avaliações do produto">
      <h2 className="text-xl font-semibold">Avaliações do produto</h2>

      {/* Histograma de notas */}
      {carregandoResumo ? (
        <Card aria-busy="true" aria-label="Carregando resumo das avaliações">
          <CardContent className="grid gap-6 py-6 sm:grid-cols-[200px_1fr]">
            <div className="space-y-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <div className="space-y-2.5">
              {NOTAS_HISTOGRAMA.map((n) => (
                <Skeleton key={n} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : resumo ? (
        <Card>
          <CardContent className="grid gap-6 py-6 sm:grid-cols-[200px_1fr] sm:items-center">
            <div className="space-y-1.5">
              <p className="text-3xl font-bold">
                {resumo.total > 0 && resumo.media != null ? resumo.media.toFixed(1) : "—"}
                <span className="text-base font-normal text-muted-foreground"> / 5</span>
              </p>
              <Estrelas media={resumo.media} total={resumo.total} />
              <p className="text-xs text-muted-foreground">
                {resumo.total} {resumo.total === 1 ? "avaliação" : "avaliações"}
              </p>
            </div>

            <div className="space-y-2" aria-label="Distribuição das notas">
              {NOTAS_HISTOGRAMA.map((nota) => {
                const quantidade = resumo.distribuicao[String(nota)] ?? 0;
                const percentual =
                  resumo.total > 0 ? Math.round((quantidade / resumo.total) * 100) : 0;
                return (
                  <div key={nota} className="flex items-center gap-3 text-xs">
                    <span className="w-8 shrink-0 font-medium">{nota}★</span>
                    <div
                      className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted"
                      aria-hidden
                    >
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-muted-foreground">
                      {quantidade} ({percentual}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Área de avaliação do usuário */}
      {!ready ? (
        <Skeleton className="h-20 w-full rounded-xl" aria-busy="true" />
      ) : !user ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="text-muted-foreground">
            Entre na sua conta de cliente para avaliar produtos que você comprou e recebeu.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => openLoginModal()}>
            Entrar
          </Button>
        </div>
      ) : user.role !== "CLIENTE" ? (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Apenas clientes que compraram e receberam este produto podem avaliá-lo.
        </div>
      ) : carregandoPode ? (
        <Skeleton className="h-24 w-full rounded-xl" aria-busy="true" />
      ) : podeAvaliarDados?.podeAvaliar ? (
        <FormularioAvaliacaoInline idProduto={idProduto} onCriada={handleAvaliacaoCriada} />
      ) : (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          {podeAvaliarDados?.motivo || "Você não pode avaliar este produto no momento."}
        </div>
      )}

      {/* Lista paginada de avaliações */}
      {carregandoLista ? (
        <div className="space-y-3" aria-busy="true" aria-label="Carregando avaliações">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : erroLista ? (
        <div className="space-y-3 rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">{erroLista}</p>
          <Button variant="outline" size="sm" onClick={() => setVersao((v) => v + 1)}>
            Tentar novamente
          </Button>
        </div>
      ) : !page || page.totalElements === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <MessageSquareIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Este produto ainda não possui avaliações.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {page.content.map((av) => (
              <Card key={av.id}>
                <CardContent className="space-y-2 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{av.nomeCliente}</span>
                      <EstrelasFixas nota={av.nota} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(av.dataAvaliacao)}
                    </span>
                  </div>
                  {av.comentario && (
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {av.comentario}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Paginacao page={page} disabled={carregandoLista} onChange={setPagina} />
        </div>
      )}
    </section>
  );
}
