import { api } from "@/services/api";
import type { AlterarSenhaRequest, AtualizarClienteRequest, Cliente } from "@/types";

/**
 * Serviços relacionados ao perfil e à conta do cliente autenticado.
 */
export const clienteService = {
  /**
   * Busca os dados do cliente logado.
   * Utiliza o ID do cliente quando fornecido ou tenta obter via /clientes/me ou /auth/me.
   */
  async getPerfil(id?: number): Promise<Cliente> {
    if (id) {
      return api.get<Cliente>(`/clientes/${id}`);
    }
    try {
      return await api.get<Cliente>("/clientes/me");
    } catch {
      const me = await api.get<{ id: number }>("/auth/me");
      return api.get<Cliente>(`/clientes/${me.id}`);
    }
  },

  /**
   * Atualiza nome e/ou telefone do cliente logado.
   */
  async atualizarPerfil(id: number | undefined, dados: AtualizarClienteRequest): Promise<Cliente> {
    if (id) {
      return api.patch<Cliente>(`/clientes/${id}`, dados);
    }
    try {
      return await api.patch<Cliente>("/clientes/me", dados);
    } catch {
      const me = await api.get<{ id: number }>("/auth/me");
      return api.patch<Cliente>(`/clientes/${me.id}`, dados);
    }
  },

  /**
   * Altera a senha do cliente autenticado via PATCH /clientes/me/senha.
   */
  async alterarSenha(dados: AlterarSenhaRequest): Promise<void> {
    return api.patch<void>("/clientes/me/senha", dados);
  },
};
