import type { Metadata } from "next";

import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta ou crie um cadastro no marketplace.",
};

export default function Page() {
  return <LoginPage />;
}
