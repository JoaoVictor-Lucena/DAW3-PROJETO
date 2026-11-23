"use client";

import * as React from "react";
import {
  KeyRoundIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  SaveIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { CabecalhoPagina } from "@/components/admin/CabecalhoPagina";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { formatPhone } from "@/lib/format";
import { getErrorMessage } from "@/services/api";
import { clienteService } from "@/services/clienteService";

export default function PerfilPage() {
  const { user } = useAuth();

  // Estados dos dados do perfil
  const [carregandoDados, setCarregandoDados] = React.useState(true);
  const [salvandoPerfil, setSalvandoPerfil] = React.useState(false);
  const [nome, setNome] = React.useState(user?.nome ?? "");
  const [telefone, setTelefone] = React.useState("");
  const [email, setEmail] = React.useState(user?.email ?? "");

  // Erros de validação do formulário de perfil
  const [erroNome, setErroNome] = React.useState<string | null>(null);

  // Estados do Dialog de troca de senha
  const [dialogSenhaAberto, setDialogSenhaAberto] = React.useState(false);
  const [salvandoSenha, setSalvandoSenha] = React.useState(false);
  const [senhaAtual, setSenhaAtual] = React.useState("");
  const [novaSenha, setNovaSenha] = React.useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = React.useState("");
  const [errosSenha, setErrosSenha] = React.useState<{
    senhaAtual?: string;
    novaSenha?: string;
    confirmacaoSenha?: string;
  }>({});

  // Carrega dados detalhados do cliente logado (nome, telefone, email)
  React.useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      try {
        setCarregandoDados(true);
        const dados = await clienteService.getPerfil(user?.id);
        if (!ativo) return;

        if (dados.nome) setNome(dados.nome);
        if (dados.email) setEmail(dados.email);
        if (dados.telefone) setTelefone(formatPhone(dados.telefone));
      } catch {
        if (!ativo) return;
        // Fallback com os dados já presentes na sessão
        if (user?.nome) setNome(user.nome);
        if (user?.email) setEmail(user.email);
        toast.error("Não foi possível carregar os dados mais recentes do perfil.");
      } finally {
        if (ativo) setCarregandoDados(false);
      }
    }

    if (user) {
      carregarPerfil();
    }

    return () => {
      ativo = false;
    };
  }, [user]);

  // Manipulação do telefone com formatação automática
  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatado = formatPhone(e.target.value);
    setTelefone(formatado);
  }

  // Envio do formulário de perfil
  async function handleSalvarPerfil(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroNome("O nome é obrigatório.");
      return;
    }
    if (nomeLimpo.length > 100) {
      setErroNome("O nome deve ter no máximo 100 caracteres.");
      return;
    }
    setErroNome(null);

    try {
      setSalvandoPerfil(true);
      const atualizado = await clienteService.atualizarPerfil(user?.id, {
        nome: nomeLimpo,
        telefone: telefone.replace(/\D/g, "") ? telefone : undefined,
      });

      // Atualiza o nome exibido na sessão salva no localStorage para sincronizar o Header
      try {
        const sessionRaw = window.localStorage.getItem("marketplace.user");
        if (sessionRaw) {
          const parsed = JSON.parse(sessionRaw);
          parsed.nome = atualizado.nome;
          window.localStorage.setItem("marketplace.user", JSON.stringify(parsed));
          window.dispatchEvent(new Event("storage"));
        }
      } catch {
        // Ignora erro de serialização local
      }

      setNome(atualizado.nome);
      if (atualizado.telefone) {
        setTelefone(formatPhone(atualizado.telefone));
      }

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSalvandoPerfil(false);
    }
  }

  // Fechamento e limpeza do modal de senha
  function fecharDialogSenha(aberto: boolean) {
    if (salvandoSenha) return;
    setDialogSenhaAberto(aberto);
    if (!aberto) {
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacaoSenha("");
      setErrosSenha({});
    }
  }

  // Envio do formulário de troca de senha
  async function handleSalvarSenha(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const novosErros: { senhaAtual?: string; novaSenha?: string; confirmacaoSenha?: string } = {};

    if (!senhaAtual) {
      novosErros.senhaAtual = "A senha atual é obrigatória.";
    }
    if (!novaSenha) {
      novosErros.novaSenha = "A nova senha é obrigatória.";
    } else if (novaSenha.length < 6) {
      novosErros.novaSenha = "A nova senha deve ter pelo menos 6 caracteres.";
    }
    if (!confirmacaoSenha) {
      novosErros.confirmacaoSenha = "Confirme a nova senha.";
    } else if (novaSenha !== confirmacaoSenha) {
      novosErros.confirmacaoSenha = "As senhas não coincidem.";
    }

    if (Object.keys(novosErros).length > 0) {
      setErrosSenha(novosErros);
      return;
    }
    setErrosSenha({});

    try {
      setSalvandoSenha(true);
      await clienteService.alterarSenha({
        senhaAtual,
        novaSenha,
      });

      toast.success("Senha alterada com sucesso!");
      fecharDialogSenha(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSalvandoSenha(false);
    }
  }

  return (
    <div className="space-y-6">
      <CabecalhoPagina
        titulo="Meu Perfil"
        descricao="Visualize e atualize suas informações de contato e credenciais de acesso."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário de Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserIcon className="size-5 text-primary" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Edite seu nome e telefone de contato cadastrados na sua conta.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSalvarPerfil} noValidate>
            <CardContent className="space-y-4">
              {carregandoDados ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <div className="relative">
                      <Input
                        id="nome"
                        type="text"
                        value={nome}
                        onChange={(e) => {
                          setNome(e.target.value);
                          if (erroNome) setErroNome(null);
                        }}
                        placeholder="Seu nome completo"
                        maxLength={100}
                        aria-invalid={!!erroNome}
                        disabled={salvandoPerfil}
                        className="pl-9"
                      />
                      <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    {erroNome && <p className="text-sm text-destructive">{erroNome}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Input
                        id="telefone"
                        type="tel"
                        value={telefone}
                        onChange={handleTelefoneChange}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        inputMode="numeric"
                        disabled={salvandoPerfil}
                        className="pl-9"
                      />
                      <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Utilizado para notificações sobre entrega de pedidos.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="cursor-not-allowed bg-muted/50 pl-9 text-muted-foreground"
                      />
                      <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O e-mail é o identificador de login da sua conta e não pode ser alterado por aqui.
                    </p>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="border-t pt-4">
              <Button type="submit" disabled={carregandoDados || salvandoPerfil}>
                {salvandoPerfil ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <SaveIcon className="size-4" />
                    Salvar alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Card de Segurança & Troca de Senha */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheckIcon className="size-5 text-primary" />
                Segurança da Conta
              </CardTitle>
              <CardDescription>
                Gerencie sua senha de acesso para manter sua conta protegida.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <LockIcon className="size-4 text-muted-foreground" />
                  Senha de Acesso
                </div>
                <p className="text-xs text-muted-foreground">
                  Recomendamos usar uma senha forte e exclusiva com pelo menos 6 caracteres, contendo
                  letras e números.
                </p>
              </div>
            </CardContent>
          </div>

          <CardFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogSenhaAberto(true)}
              className="w-full sm:w-auto"
            >
              <KeyRoundIcon className="size-4" />
              Trocar Senha
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Dialog para Trocar Senha */}
      <Dialog open={dialogSenhaAberto} onOpenChange={fecharDialogSenha}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRoundIcon className="size-5 text-primary" />
              Trocar Senha
            </DialogTitle>
            <DialogDescription>
              Informe sua senha atual e escolha uma nova senha para sua conta.
            </DialogDescription>
          </DialogHeader>

          <form id="form-trocar-senha" onSubmit={handleSalvarSenha} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="senhaAtual">Senha Atual</Label>
              <Input
                id="senhaAtual"
                type="password"
                autoComplete="current-password"
                value={senhaAtual}
                onChange={(e) => {
                  setSenhaAtual(e.target.value);
                  if (errosSenha.senhaAtual) {
                    setErrosSenha((prev) => ({ ...prev, senhaAtual: undefined }));
                  }
                }}
                disabled={salvandoSenha}
                aria-invalid={!!errosSenha.senhaAtual}
              />
              {errosSenha.senhaAtual && (
                <p className="text-sm text-destructive">{errosSenha.senhaAtual}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <Input
                id="novaSenha"
                type="password"
                autoComplete="new-password"
                value={novaSenha}
                onChange={(e) => {
                  setNovaSenha(e.target.value);
                  if (errosSenha.novaSenha) {
                    setErrosSenha((prev) => ({ ...prev, novaSenha: undefined }));
                  }
                }}
                disabled={salvandoSenha}
                aria-invalid={!!errosSenha.novaSenha}
              />
              {errosSenha.novaSenha && (
                <p className="text-sm text-destructive">{errosSenha.novaSenha}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmacaoSenha">Confirmar Nova Senha</Label>
              <Input
                id="confirmacaoSenha"
                type="password"
                autoComplete="new-password"
                value={confirmacaoSenha}
                onChange={(e) => {
                  setConfirmacaoSenha(e.target.value);
                  if (errosSenha.confirmacaoSenha) {
                    setErrosSenha((prev) => ({ ...prev, confirmacaoSenha: undefined }));
                  }
                }}
                disabled={salvandoSenha}
                aria-invalid={!!errosSenha.confirmacaoSenha}
              />
              {errosSenha.confirmacaoSenha && (
                <p className="text-sm text-destructive">{errosSenha.confirmacaoSenha}</p>
              )}
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={salvandoSenha}
              onClick={() => fecharDialogSenha(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" form="form-trocar-senha" disabled={salvandoSenha}>
              {salvandoSenha ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
