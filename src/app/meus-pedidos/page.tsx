import { redirect } from "next/navigation";

/** Rota antiga: os pedidos agora ficam no painel do cliente. */
export default function Page() {
  redirect("/conta/pedidos");
}
