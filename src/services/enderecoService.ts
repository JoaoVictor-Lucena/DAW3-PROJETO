import { api, normalizePage } from "@/services/api";
import type { Endereco, RawPage } from "@/types";

interface EnderecoApi {
  id: number;
  rua: string;
  numero: string;
  complemento: string | null;
  cep: string;
  cidade: string;
  estado: string;
}

/** O back-end não guarda bairro; o campo volta vazio. */
function fromApi(e: EnderecoApi): Endereco {
  return {
    id: e.id,
    cep: e.cep,
    logradouro: e.rua,
    numero: e.numero,
    complemento: e.complemento ?? undefined,
    bairro: "",
    cidade: e.cidade,
    uf: e.estado,
  };
}

/** Endereços do cliente logado (rotas /enderecos). */
export const enderecoService = {
  async getEnderecos(): Promise<Endereco[]> {
    const page = normalizePage(await api.get<RawPage<EnderecoApi>>("/enderecos"));
    return page.content.map(fromApi);
  },

  async criar(e: Omit<Endereco, "id">): Promise<Endereco> {
    const criado = await api.post<EnderecoApi>("/enderecos", {
      rua: e.logradouro,
      numero: e.numero,
      complemento: e.complemento || undefined,
      cep: e.cep,
      cidade: e.cidade,
      estado: e.uf.toUpperCase(),
    });
    return { ...fromApi(criado), bairro: e.bairro };
  },

  /** O back-end expõe a edição como PATCH /enderecos/{id} (não há PUT). */
  async atualizar(id: number, e: Omit<Endereco, "id">): Promise<Endereco> {
    const atualizado = await api.patch<EnderecoApi>(`/enderecos/${id}`, {
      rua: e.logradouro,
      numero: e.numero,
      complemento: e.complemento || undefined,
      cep: e.cep,
      cidade: e.cidade,
      estado: e.uf.toUpperCase(),
    });
    return { ...fromApi(atualizado), bairro: e.bairro };
  },

  excluir: (id: number) => api.delete(`/enderecos/${id}`),
};
