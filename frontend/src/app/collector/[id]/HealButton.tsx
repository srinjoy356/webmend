"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function HealButton({ collectorId }: { collectorId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction() {
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${API_URL}/api/collectors/${collectorId}/heal/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error(`Failed to trigger heal`);
        router.refresh(); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleAction} 
      disabled={loading} 
      className="bg-crimson-deep hover:bg-crimson-deep/90 text-white border-none shadow-[0_0_15px_rgba(255,51,102,0.5)]"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Zap className="mr-2 h-4 w-4" />
      )}
      Trigger AI Heal
    </Button>
  );
}
