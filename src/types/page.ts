/**
 * Page<T> do Spring Data. O Spring Boot 4 pode devolver os metadados
 * achatados (totalElements, ...) ou aninhados em `page`; ambos são tipados
 * e `normalizePage` (services/api.ts) unifica o formato.
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface RawPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
  page?: {
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}
