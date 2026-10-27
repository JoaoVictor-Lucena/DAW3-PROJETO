"use client";

import { FileCodeIcon, FileSpreadsheetIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Produto } from "@/types";

interface Props {
  produtos: Produto[];
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

export function ExportProductsButton({ produtos, disabled }: Props) {
  const empty = produtos.length === 0;

  function handleExportCSV() {
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
    toast.success(`${produtos.length} produto(s) exportado(s) para CSV.`);
  }

  function handleExportJSON() {
    const json = JSON.stringify(produtos, null, 2);
    triggerDownload(json, "produtos.json", "application/json;charset=utf-8;");
    toast.success(`${produtos.length} produto(s) exportado(s) para JSON.`);
  }

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
        disabled={disabled || empty}
        onClick={handleExportCSV}
        title="Exportar produtos visíveis para CSV"
      >
        <FileSpreadsheetIcon />
        <span className="hidden sm:inline">Exportar</span> CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={disabled || empty}
        onClick={handleExportJSON}
        title="Exportar produtos visíveis para JSON"
      >
        <FileCodeIcon />
        <span className="hidden sm:inline">Exportar</span> JSON
      </Button>
    </div>
  );
}
