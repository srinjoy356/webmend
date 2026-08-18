import { BentoCard } from "@/components/ui/bento-card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Monitor, Activity, ShieldCheck, Database, ArrowRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { CreateCollectorModal } from "./CreateCollectorModal";

async function getCollectors() {
  const res = await fetch("http://localhost:3001/api/collectors", { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch collectors");
  return res.json();
}

export default async function OverviewPage() {
  const collectors = await getCollectors();

  const totalRuns = collectors.reduce((acc: number, c: any) => acc + (Number(c.runCount) || 0), 0);
  const activeIssues = collectors.filter((c: any) => c.status === "awaiting_approval").length;
  const healthyCount = collectors.filter((c: any) => c.status === "healthy").length;

  return (
    <main className="max-w-7xl mx-auto w-full">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-on-surface">
            Command Center
          </h1>
          <p className="text-on-surface/60 mt-2 text-lg font-sans max-w-xl">
            Monitor scraper health, detect schema drifts, and review AI-proposed heals before they deploy.
          </p>
        </div>
        <div>
          <CreateCollectorModal />
        </div>
        <div className="flex gap-4">
          <Badge variant={collectors.length > 0 && healthyCount === collectors.length ? "success" : "warning"}>
            {healthyCount} / {collectors.length} Healthy
          </Badge>
          {activeIssues > 0 && <Badge variant="destructive">{activeIssues} Action Required</Badge>}
        </div>
      </header>

      {collectors.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-on-surface/20 rounded-xl flex flex-col items-center text-center">
          <Activity className="h-12 w-12 text-on-surface/40 mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">No Collectors Found</h2>
          <p className="text-on-surface/60 font-mono text-sm max-w-md">
            There are currently no collectors configured. Update collector_config.js in the backend to start monitoring.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
          {/* System Stats (2x1) */}
          <BentoCard className="md:col-span-2 lg:col-span-2 flex flex-col justify-between" variant="primary">
            <div className="flex items-center justify-between opacity-80">
              <span className="font-mono text-sm tracking-widest uppercase">System Load</span>
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-6xl font-display font-extrabold tracking-tighter">{totalRuns}</div>
              <div className="text-on-primary/70 font-mono text-sm mt-2 uppercase">Total Operations Logged</div>
            </div>
          </BentoCard>

          {/* Collectors Loop */}
          {collectors.map((collector: any) => {
            const isPending = collector.status === "awaiting_approval";
            const isHealthy = collector.status === "healthy";
            const isBroken = collector.status === "broken";

            return (
              <Link key={collector.id} href={`/collector/${collector.id}`} className="block h-full group">
                <BentoCard 
                  interactive 
                  className={`h-full flex flex-col justify-between ${isPending ? 'border-crimson-deep' : ''}`}
                  variant={isPending ? "accent" : "default"}
                >
                  <div className="flex justify-between items-start">
                    <Badge 
                      variant={isPending ? "default" : isHealthy ? "success" : "destructive"} 
                      className={isPending ? "bg-white text-crimson-deep border-transparent" : ""}
                    >
                      {isPending ? "Pending Approval" : isHealthy ? "Healthy" : "Broken"}
                    </Badge>
                    {isPending && <AlertTriangle className="h-5 w-5 opacity-90" />}
                    {isHealthy && <CheckCircle2 className="h-5 w-5 text-forest-pro opacity-90" />}
                    {isBroken && <Clock className="h-5 w-5 text-crimson-deep opacity-90" />}
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-bold mb-1 truncate">{collector.name}</h3>
                    <div className="font-mono text-xs opacity-70 tracking-wider truncate">{collector.target_url || collector.url}</div>
                    
                    <div className="mt-4 pt-4 border-t border-current/10 flex justify-between font-mono text-xs opacity-80">
                      <span>Uptime: {collector.uptime ?? 100}%</span>
                      <span>Runs: {collector.runCount || 0}</span>
                    </div>
                  </div>
                </BentoCard>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
