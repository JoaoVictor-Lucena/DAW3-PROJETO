import { api } from "@/services/api";
import type { Cupom } from "@/types";

interface CupomValidacaoResponse {
  id?: number;
  codigo: string;
  valorDesconto?: number;
  desconto?: number;
  dataExpiracao?: string | null;
  status?: string;
}

export const cupomService = {
  /**
   * Valida se um cupom pode ser aplicado na compra.
   * Faz GET /cupons/validar?codigo={codigo}.
   * Responde com os dados do cupom ou lança ApiError (422) se inexistente/expirado/inativo.
   */
  async validar(codigo: string): Promise<Cupom> {
    const data = await api.get<CupomValidacaoResponse>("/cupons/validar", {
      query: { codigo: codigo.trim() },
    });

    return {
      codigo: data.codigo,
      desconto: data.desconto ?? data.valorDesconto ?? 0,
    };
  },

  validarCupom(codigo: string): Promise<Cupom> {
    return this.validar(codigo);
  },
};

export const validarCupom = (codigo: string) => cupomService.validar(codigo);
