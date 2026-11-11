/** Rotas públicas da loja: o visitante navega sem login. */
import { Header } from "@/components/layout/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
