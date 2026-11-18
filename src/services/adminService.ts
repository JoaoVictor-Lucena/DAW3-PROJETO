import { api, normalizePage } from "@/services/api";
import type {
  AdminRequest,
  Avaliacao,
  CupomAdmin,
  CupomRequest,
  DashboardAdmin,
  Page,
  Pedido,
  PedidoHistorico,
  Periodo,
  Produto,
  RawPage,
  Role,
  StatusCupom,
  StatusPedido,
  UsuarioAdmin,
} from "@/types";

async function pagina<T>(path: string, query: Record<string, string | number | boolean | undefined>) {
  return normalizePage(await api.get<RawPage<T>>(path, { query }));
}

/** Chamadas usadas só pelo painel do administrador (todas exigem perfil ADMIN no back-end). */
export const adminService = {
  dashboard: (periodo: Periodo) =>
    api.get<DashboardAdmin>("/dashboard/admin", { query: { periodo } }),

  usuarios: (filtros: { role: Role; nome?: string; ativo?: boolean; page: number }) =>
    pagina<UsuarioAdmin>("/usuarios", { ...filtros, nome: filtros.nome?.trim() }),

  alterarAtivo: (id: number, ativo: boolean) =>
    api.patch<UsuarioAdmin>(`/usuarios/${id}/ativo`, { ativo }),

  criarAdmin: (dto: AdminRequest) => api.post("/admin", dto),

  produtos: (filtros: { idVendedor?: number; nome?: string; ativo?: boolean; page: number }) =>
    pagina<Produto>("/produtos/todos", { ...filtros, nome: filtros.nome?.trim() }),

  pausarProduto: (id: number, ativo: boolean) => api.patch<Produto>(`/produtos/${id}`, { ativo }),

  pedidos: (filtros: { status?: StatusPedido; page: number }): Promise<Page<Pedido>> =>
    pagina<Pedido>("/pedidos", filtros),

  historicoPedido: (id: number) => api.get<PedidoHistorico[]>(`/pedidos/${id}/historico`),

  avaliacoes: (page: number) => pagina<Avaliacao>("/avaliacoes", { page }),

  removerAvaliacao: (id: number) => api.delete<void>(`/avaliacoes/${id}`),

  cupons: (filtros: { codigo?: string; status?: StatusCupom; page: number }) =>
    pagina<CupomAdmin>("/cupons/buscar", { ...filtros, codigo: filtros.codigo?.trim() }),

  criarCupom: (dto: CupomRequest) => api.post<CupomAdmin>("/cupons", dto),

  atualizarCupom: (id: number, dto: CupomRequest) => api.patch<CupomAdmin>(`/cupons/${id}`, dto),

  removerCupom: (id: number) => api.delete<void>(`/cupons/${id}`),
};
