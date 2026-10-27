import type { Page, ProblemDetail, RawPage } from "@/types";

const API_BASE_URL = "/api";

const TOKEN_KEY = "marketplace.token";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetail;

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title);
    this.name = "ApiError";
    this.status = problem.status;
    this.problem = problem;
  }

  get erros(): Record<string, string> {
    return this.problem.erros ?? {};
  }
}

const DEFAULT_TITLES: Record<number, string> = {
  400: "Dados inválidos",
  401: "Não autenticado",
  403: "Acesso negado",
  404: "Não encontrado",
  409: "Conflito",
  422: "Operação não permitida",
};

async function toApiError(response: Response): Promise<ApiError> {
  let body: Partial<ProblemDetail> | null = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const status = body?.status ?? response.status;
  return new ApiError({
    type: body?.type ?? "ERRO_INESPERADO",
    title: body?.title ?? DEFAULT_TITLES[status] ?? "Erro inesperado",
    status,
    detail:
      body?.detail ??
      (status >= 500
        ? "Não foi possível comunicar com o servidor."
        : DEFAULT_TITLES[status] ?? "Erro inesperado."),
    instance: body?.instance,
    timestamp: body?.timestamp,
    erros: body?.erros,
  });
}

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions extends Omit<RequestInit, "body" | "method"> {
  body?: unknown;
  query?: Record<string, QueryValue>;
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<T>(
  method: string,
  path: string,
  { body, query, skipAuth, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (body !== undefined) finalHeaders.set("Content-Type", "application/json");

  const token = skipAuth ? null : tokenStorage.get();
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError({
      type: "ERRO_INESPERADO",
      title: "Falha de conexão",
      status: 0,
      detail: "Não foi possível conectar ao servidor.",
    });
  }

  if (!response.ok) throw await toApiError(response);

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType && !contentType.includes("json")) {
    return text as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, options),
};

export function normalizePage<T>(raw: RawPage<T>): Page<T> {
  const meta = raw.page ?? raw;
  const number = meta.number ?? 0;
  const totalPages = meta.totalPages ?? 0;
  return {
    content: raw.content ?? [],
    totalElements: meta.totalElements ?? raw.content?.length ?? 0,
    totalPages,
    number,
    size: meta.size ?? 10,
    first: raw.first ?? number === 0,
    last: raw.last ?? number >= totalPages - 1,
    numberOfElements: raw.numberOfElements ?? raw.content?.length,
    empty: raw.empty ?? !raw.content?.length,
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Erro inesperado.";
}
