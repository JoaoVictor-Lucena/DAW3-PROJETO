import { RoleGuard } from "@/components/layout/RoleGuard";
import { VendedorSidebar } from "@/components/vendedor/VendedorSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["VENDEDOR"]}>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
        <VendedorSidebar />
        <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 space-y-6 outline-none">{children}</main>
      </div>
    </RoleGuard>
  );
}
