import { api, normalizePage } from "@/services/api";
import type { Notificacao, Page, RawPage } from "@/types";

const BASE = "/notificacoes";

/** Notificações do usuário logado (qualquer perfil). */
export const notificacaoService = {
  async listar(page = 0, somenteNaoLidas = false): Promise<Page<Notificacao>> {
    return normalizePage(
      await api.get<RawPage<Notificacao>>(BASE, { query: { page, somenteNaoLidas } }),
    );
  },

  async contarNaoLidas(): Promise<number> {
    return (await api.get<{ naoLidas: number }>(`${BASE}/nao-lidas/contagem`)).naoLidas;
  },

  marcarComoLida: (id: number) => api.patch<Notificacao>(`${BASE}/${id}/lida`),

  marcarTodasComoLidas: () => api.patch<{ naoLidas: number }>(`${BASE}/lidas`),
};
