"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto w-full mt-20 p-12 border-2 border-crimson-deep bg-surface-container-lowest rounded-xl flex flex-col items-center text-center">
      <AlertTriangle className="h-16 w-16 text-crimson-deep mb-6" />
      <h2 className="text-3xl font-display font-bold mb-4">Dashboard Unavailable</h2>
      <p className="text-on-surface/70 font-mono mb-8 max-w-lg">
        The backend API could not be reached. Ensure the collector service is running.
        <br/><br/>
        <span className="text-xs opacity-75">{error.message}</span>
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-crimson-deep text-white px-6 py-3 rounded-full font-mono text-sm tracking-widest uppercase hover:scale-105 transition-transform"
      >
        <RefreshCcw className="h-4 w-4" />
        Retry Connection
      </button>
    </div>
  );
}
