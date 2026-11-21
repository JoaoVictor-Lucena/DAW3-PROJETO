import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };

import { Header } from "@/components/layout/Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
