"use client";

import * as React from "react";
import { FileCodeIcon, FileSpreadsheetIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/services/api";
import type { Produto } from "@/types";

type Formato = "csv" | "json";

interface Props {
  /** Busca todos os produtos que atendem aos filtros atuais (todas as páginas). */
  carregarProdutos: () => Promise<Produto[]>;
  disabled?: boolean;
}

function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[;"\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportarCSV(produtos: Produto[]) {
  const headers = [
    "id",
    "nome",
    "descricao",
    "preco",
    "estoque",
    "idCategoria",
    "nomeCategoria",
    "idVendedor",
    "nomeVendedor",
  ];
  const rows = produtos.map((p) =>
    [
      p.id,
      p.nome,
      p.descricao ?? "",
      p.preco,
      p.estoque,
      p.idCategoria,
      p.nomeCategoria,
      p.idVendedor,
      p.nomeVendedor,
    ]
      .map(escapeCsvCell)
      .join(";"),
  );

  const csv = `\uFEFF${[headers.join(";"), ...rows].join("\r\n")}`;
  triggerDownload(csv, "produtos.csv", "text/csv;charset=utf-8;");
}

function exportarJSON(produtos: Produto[]) {
  const json = JSON.stringify(produtos, null, 2);
  triggerDownload(json, "produtos.json", "application/json;charset=utf-8;");
}

export function ExportProductsButton({ carregarProdutos, disabled }: Props) {
  const [exportando, setExportando] = React.useState<Formato | null>(null);

  async function handleExport(formato: Formato) {
    setExportando(formato);
    try {
      const produtos = await carregarProdutos();
      if (produtos.length === 0) {
        toast.info("Nenhum produto para exportar.");
        return;
      }
      if (formato === "csv") exportarCSV(produtos);
      else exportarJSON(produtos);
      toast.success(
        `${produtos.length} produto(s) exportado(s) para ${formato.toUpperCase()}.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExportando(null);
    }
  }

  const bloqueado = disabled || exportando !== null;

  return (
    <div
      className="inline-flex items-center gap-1.5"
      role="group"
      aria-label="Exportar produtos"
    >
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={bloqueado}
        onClick={() => void handleExport("csv")}
        title="Exportar todos os produtos filtrados para CSV"
      >
        {exportando === "csv" ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <FileSpreadsheetIcon />
        )}
        <span className="hidden sm:inline">Exportar</span> CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={bloqueado}
        onClick={() => void handleExport("json")}
        title="Exportar todos os produtos filtrados para JSON"
      >
        {exportando === "json" ? <Loader2Icon className="animate-spin" /> : <FileCodeIcon />}
        <span className="hidden sm:inline">Exportar</span> JSON
      </Button>
    </div>
  );
}
