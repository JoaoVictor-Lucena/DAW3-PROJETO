/** Rotas protegidas: cada área tem o seu RoleGuard no próprio layout. */
import { Header } from "@/components/layout/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
