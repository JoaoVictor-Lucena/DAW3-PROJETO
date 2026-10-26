import { redirect } from "next/navigation";

// O AuthProvider redireciona para /login quando não há sessão.
export default function Home() {
  redirect("/produtos");
}
