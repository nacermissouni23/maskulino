"use client";
import { X } from "lucide-react";

/** Coquille modale commune aux 3 exports (même style que les modals admin). */
export function ExportModal({
  title,
  countLabel,
  downloading,
  canDownload,
  emptyHint,
  onClose,
  onDownload,
  children,
}: {
  title: string;
  countLabel: string;
  downloading: boolean;
  canDownload: boolean;
  emptyHint?: string;
  onClose: () => void;
  onDownload: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#f5f3ee] w-full sm:max-w-[560px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <p className="font-title font-semibold">{title}</p>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center shrink-0"
          >
            <X size={15} />
          </button>
        </div>
        <p className="text-xs font-light text-stone-500 mb-3">{countLabel}</p>
        <div className="space-y-2.5">{children}</div>
        {!canDownload && emptyHint && (
          <p className="text-xs font-medium text-[#c0452f] mt-3">{emptyHint}</p>
        )}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1">
            Annuler
          </button>
          <button
            onClick={onDownload}
            disabled={!canDownload || downloading}
            className="btn-dark flex-1 disabled:opacity-50"
          >
            {downloading ? "Génération…" : "Télécharger (.xlsx)"}
          </button>
        </div>
        <p className="text-[11px] font-light text-stone-400 mt-3 text-center">
          Fichier Excel réel (.xlsx) — s&apos;ouvre dans Excel et Google Sheets.
        </p>
      </div>
    </div>
  );
}

/** Petit champ filtre homogène pour les modals d'export. */
export function ExportField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-bold !text-[10px] text-stone-500">{label}</span>
      <span className="block mt-1.5">{children}</span>
    </label>
  );
}
