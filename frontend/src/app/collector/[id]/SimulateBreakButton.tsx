"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SimulateBreakButton({ collectorId }: { collectorId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSimulate() {
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${API_URL}/api/collectors/${collectorId}/simulate-break`, {
        method: "POST",
      });
      if (res.ok) {
        // Refresh the page
        router.refresh();
      } else {
        console.error(`Failed to simulate break`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      // We keep loading true for a bit since it's an async backend process
      setTimeout(() => setLoading(false), 2000);
    }
  }

  return (
    <Button variant="default" onClick={handleSimulate} disabled={loading} size="sm" className="ml-4 font-mono uppercase text-xs tracking-widest bg-red-600 hover:bg-red-700 text-white">
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <AlertTriangle className="mr-2 h-4 w-4" />
      )}
      Simulate Live Break
    </Button>
  );
}
