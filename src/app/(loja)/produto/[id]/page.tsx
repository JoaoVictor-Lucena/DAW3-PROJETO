import * as React from "react";
import { redirect } from "next/navigation";

async function RedirecionarProduto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return redirect(`/produtos/${encodeURIComponent(id)}`);
}

export default function ProdutoRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <React.Suspense fallback={null}>
      <RedirecionarProduto params={params} />
    </React.Suspense>
  );
}
