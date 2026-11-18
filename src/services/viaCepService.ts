export interface ViaCepEndereco {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  cidade?: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean | string;
}

/**
 * Consulta endereço por CEP usando o webservice do ViaCEP.
 * @param cep CEP com ou sem formatação (ex: "58400-000" ou "58400000").
 */
export async function buscarCep(cep: string): Promise<ViaCepEndereco> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) {
    throw new Error("CEP inválido. Deve conter 8 dígitos.");
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP no ViaCEP.");
  }

  const data = (await response.json()) as ViaCepEndereco;
  if (data.erro) {
    throw new Error("CEP não encontrado.");
  }

  return {
    ...data,
    cidade: data.localidade,
  };
}

export const viaCepService = {
  buscarCep,
};
