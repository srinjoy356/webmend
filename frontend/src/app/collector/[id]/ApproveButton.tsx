"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ApproveButton({ collectorId }: { collectorId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${API_URL}/api/collectors/${collectorId}/heal/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        // Refresh the page
        router.refresh();
      } else {
        console.error(`Failed to ${action} heal`);
        router.refresh(); // Refresh anyway to show the error event in timeline
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => handleAction('approve')} disabled={loading} size="lg">
        {loading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-5 w-5" />
        )}
        Approve & Deploy Fix
      </Button>
      
      <Button variant="outline" onClick={() => handleAction('reject')} disabled={loading} size="lg">
        Reject
      </Button>
    </div>
  );
}
