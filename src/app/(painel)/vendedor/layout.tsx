import { RoleGuard } from "@/components/layout/RoleGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow={["VENDEDOR"]}>{children}</RoleGuard>;
}
