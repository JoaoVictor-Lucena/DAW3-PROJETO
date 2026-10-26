import { api } from "@/services/api";

/** Endpoints restritos a ADMIN. */
export const seedService = {
  popular: () => api.post<unknown>("/seed/popular"),
  resetar: () => api.post<unknown>("/seed/resetar"),
  limpar: () => api.delete<unknown>("/seed/limpar"),
};
