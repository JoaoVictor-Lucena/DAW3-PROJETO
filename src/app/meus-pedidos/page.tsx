import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Meus pedidos" };

export default function Page() {
  redirect("/conta/pedidos");
}
