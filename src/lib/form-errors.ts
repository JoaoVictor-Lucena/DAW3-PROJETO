import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError } from "@/services/api";

export function applyApiFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): boolean {
  if (!(error instanceof ApiError)) return false;
  let applied = false;
  for (const [campo, mensagem] of Object.entries(error.erros)) {
    if (fields.includes(campo)) {
      setError(campo as Path<T>, { type: "server", message: mensagem });
      applied = true;
    }
  }
  return applied;
}
