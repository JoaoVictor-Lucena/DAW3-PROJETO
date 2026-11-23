/** Rotas públicas da loja: o visitante navega sem login. */
import { BarraBeneficios } from "@/components/layout/BarraBeneficios";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BarraBeneficios />
      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">{children}</main>
      <Footer />
    </div>
  );
}
