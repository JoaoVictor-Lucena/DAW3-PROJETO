/** Rotas protegidas: cada área tem o seu RoleGuard no próprio layout. */
import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
