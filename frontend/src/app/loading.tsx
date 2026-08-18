import { BentoCard } from "@/components/ui/bento-card";
import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto w-full animate-pulse">
      <header className="mb-12 flex justify-between items-end opacity-50">
        <div>
          <div className="h-12 w-64 bg-on-surface/10 rounded-md mb-2"></div>
          <div className="h-4 w-48 bg-on-surface/10 rounded-md"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-6 w-24 bg-on-surface/10 rounded-full"></div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
        <BentoCard className="md:col-span-2 lg:col-span-2 flex flex-col justify-between" variant="primary">
          <div className="flex items-center justify-between opacity-50">
            <span className="font-mono text-sm tracking-widest uppercase">System Load</span>
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="h-16 w-32 bg-on-primary/20 rounded-md"></div>
            <div className="h-4 w-48 bg-on-primary/20 rounded-md mt-4"></div>
          </div>
        </BentoCard>

        {[1, 2, 3].map((i) => (
          <BentoCard key={i} className="h-full flex flex-col justify-between opacity-50">
            <div className="h-6 w-24 bg-on-surface/10 rounded-full"></div>
            <div>
              <div className="h-8 w-3/4 bg-on-surface/10 rounded-md mb-2"></div>
              <div className="h-3 w-full bg-on-surface/10 rounded-md mb-4"></div>
              <div className="mt-4 pt-4 border-t border-current/10 flex justify-between">
                <div className="h-3 w-16 bg-on-surface/10 rounded-md"></div>
                <div className="h-3 w-16 bg-on-surface/10 rounded-md"></div>
              </div>
            </div>
          </BentoCard>
        ))}
      </div>
    </main>
  );
}
