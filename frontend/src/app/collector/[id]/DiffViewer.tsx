"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

export function DiffViewer({ oldData, newData }: { oldData: any; newData: any }) {
  const oldJson = oldData ? JSON.stringify(oldData, null, 2) : "{\n  // No previous data\n}";
  const newJson = newData ? JSON.stringify(newData, null, 2) : "{\n  // No preview data\n}";

  return (
    <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-[10px] overflow-hidden rounded-md border border-on-surface/20">
      {/* Old Data */}
      <div className="bg-surface-low border-r border-on-surface/20 flex flex-col">
        <div className="bg-on-surface/5 px-2 py-1 flex items-center gap-2 border-b border-on-surface/10 text-on-surface/60 font-bold uppercase tracking-widest">
          <AlertCircle className="h-3 w-3" /> Previous Schema
        </div>
        <pre className="p-3 overflow-x-auto text-on-surface/70">
          {oldJson}
        </pre>
      </div>

      {/* New Data */}
      <div className="bg-[#1e1e1e] text-[#d4d4d4] flex flex-col">
        <div className="bg-black/20 px-2 py-1 flex items-center gap-2 border-b border-white/10 text-forest-pro font-bold uppercase tracking-widest">
          <CheckCircle2 className="h-3 w-3" /> Proposed Fix Preview
        </div>
        <pre className="p-3 overflow-x-auto text-green-400">
          {newJson}
        </pre>
      </div>
    </div>
  );
}
