import { PaginaNaoEncontrada } from "@/components/layout/PaginaNaoEncontrada";

/** notFound() dentro da loja (produto, categoria ou loja inexistente): o layout já tem header e rodapé. */
export default function NotFound() {
  return <PaginaNaoEncontrada />;
}
