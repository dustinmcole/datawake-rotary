"use client";

import { AlertTriangle, Check, X } from "lucide-react";

interface ConfirmationCardProps {
  action: string;
  preview: Record<string, unknown>;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function ConfirmationCard({
  action,
  preview,
  onConfirm,
  onCancel,
  disabled,
}: ConfirmationCardProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-2">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            Confirmation Required
          </p>
          <p className="text-sm text-amber-700 mb-3">
            Bryn wants to: <strong>{action.replace(/_/g, " ")}</strong>
          </p>
          <div className="bg-white/70 rounded-lg p-3 text-xs text-gray-700 mb-3 space-y-1 font-mono">
            {Object.entries(preview).map(([key, val]) => (
              <div key={key}>
                <span className="text-gray-500">{key}:</span>{" "}
                {typeof val === "object" ? JSON.stringify(val, null, 2) : String(val)}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onConfirm}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm
            </button>
            <button
              onClick={onCancel}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
