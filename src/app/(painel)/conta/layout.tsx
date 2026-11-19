import { RoleGuard } from "@/components/layout/RoleGuard";
import { ContaSidebar } from "@/components/pedidos/ContaSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["CLIENTE"]}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
        <ContaSidebar />
        <main className="min-w-0 flex-1 space-y-6">{children}</main>
      </div>
    </RoleGuard>
  );
}
