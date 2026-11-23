"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RoleGuard } from "@/components/layout/RoleGuard";
import { ProductForm } from "@/components/produtos/ProductForm";
import { useAuth } from "@/context/AuthContext";
import { produtoService } from "@/services/produtoService";
import type { ProdutoRequest } from "@/types";

export default function NovoProdutoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const destino = user?.role === "VENDEDOR" ? "/vendedor/produtos" : "/produtos";

  async function handleSubmit(dto: ProdutoRequest) {
    const criado = await produtoService.criar(dto);
    toast.success(`Produto "${criado.nome}" criado com sucesso.`);
    router.push(destino);
  }

  return (
    <RoleGuard allow={["ADMIN", "VENDEDOR"]}>
      <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold">Novo Produto</h1>
        <ProductForm submitLabel="Criar produto" voltarHref={destino} onSubmit={handleSubmit} />
      </div>
    </RoleGuard>
  );
}
