import { BentoCard } from "@/components/ui/bento-card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Activity, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { ApproveButton } from "./ApproveButton";
import { HistoryCharts } from "./HistoryCharts";
import { SimulateBreakButton } from "./SimulateBreakButton";
import { RunButton } from "./RunButton";
import { DiffViewer } from "./DiffViewer";

async function getCollectorData(id: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const [collectorsRes, eventsRes] = await Promise.all([
    fetch(`${API_URL}/api/collectors`, { cache: 'no-store' }),
    fetch(`${API_URL}/api/collectors/${id}/events`, { cache: 'no-store' })
  ]);
  if (!collectorsRes.ok || !eventsRes.ok) throw new Error("Failed to fetch data");
  
  const collectors = await collectorsRes.json();
  const events = await eventsRes.json();
  const collector = collectors.find((c: any) => c.id === id);
  if (!collector) throw new Error("Collector not found");
  
  // Fetch detailed collector data including rows
  const detailRes = await fetch(`${API_URL}/api/collectors/${id}`, { cache: 'no-store' });
  if (!detailRes.ok) throw new Error("Failed to fetch collector details");
  const detailData = await detailRes.json();
  
  return { collector: detailData, events };
}

export default async function CollectorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCollectorData(id);
  if (!data) return <div>Failed to load data</div>;

  const { collector, events } = data;
  const topEvent = events && events.length > 0 ? events[0].event_type : null;
  const isPending = topEvent === 'heal_pending';
  const isHealing = topEvent === 'heal_started';
  const hideSimulate = isPending || isHealing;

  return (
    <main className="max-w-7xl mx-auto w-full">
      <header className="mb-12">
        <Link href="/" className="inline-flex items-center text-sm font-mono tracking-widest uppercase text-on-surface/60 hover:text-on-surface transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Console
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-5xl font-extrabold tracking-tight font-display text-on-surface">{collector.name}</h1>
              {!hideSimulate && (
                <div className="flex gap-2">
                  <RunButton collectorId={collector.id} />
                  {collector.id === "c_mswy3fc02128qburqf" && (
                    <SimulateBreakButton collectorId={collector.id} />
                  )}
                </div>
              )}
            </div>
            <p className="text-on-surface/70 font-mono text-sm tracking-widest">{collector.url || collector.target_url}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant={isPending ? "destructive" : isHealing ? "warning" : collector.latest_run?.status === "success" ? "success" : "warning"}
              className="text-sm px-4 py-1 uppercase"
            >
              {isPending ? "Heal Pending Approval" : isHealing ? "Healing In Progress" : (collector.latest_run?.status || "UNKNOWN")}
            </Badge>
            {collector.uptime !== undefined && (
              <div className="font-mono text-xs uppercase tracking-widest opacity-70">
                Reliability: {collector.uptime}%
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Timeline */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <h2 className="text-xl font-bold font-display tracking-tight flex items-center">
            <Activity className="h-5 w-5 mr-2" /> Action Timeline
          </h2>
          <div className="pl-4 border-l-2 border-on-surface/10 space-y-8 py-2 relative">
            {events.map((event: any, idx: number) => {
              const isHeal = event.event_type === 'heal_pending' || event.event_type === 'heal_approved';
              const isBreak = event.event_type === 'break' || event.event_type === 'schema_break_detected';
              
              let Icon = CheckCircle2;
              let iconColor = "text-forest-pro";
              let bg = "bg-surface-low";
              let border = "border-on-surface/10";
              
              if (isHeal) {
                Icon = Zap;
                iconColor = "text-crimson-deep";
                bg = "bg-crimson-deep/10";
                border = "border-crimson-deep";
              } else if (isBreak) {
                Icon = AlertTriangle;
                iconColor = "text-yellow-600";
              }

              return (
                <div key={event.id} className="relative">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full border-2 border-background bg-on-surface ${isHeal ? 'bg-crimson-deep ring-2 ring-crimson-deep/30' : ''}`}></div>
                  
                  <BentoCard className={`!p-4 border-2 ${border} ${bg} transition-colors`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                        <span className="font-mono text-xs uppercase tracking-wider font-bold">
                          {event.event_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-on-surface/50">
                        {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {event.details?.generatedPrompt && (
                      <p className="text-sm font-sans text-on-surface/80 mt-2 border-l-2 pl-3 border-on-surface/20">
                        {event.details.generatedPrompt}
                      </p>
                    )}
                    
                    {event.event_type === 'heal_pending' && isPending && idx === 0 && (
                      <div className="mt-4 border-t border-on-surface/10 pt-4">
                        <div className="mb-4">
                          <DiffViewer 
                            oldData={collector.rows?.[collector.rows.length - 1] || {}} 
                            newData={event.details?.resultEnvelope?.preview_result?.[0] || {}} 
                          />
                        </div>
                        <ApproveButton collectorId={collector.id} />
                      </div>
                    )}
                  </BentoCard>
                </div>
              );
            })}
            
            {events.length === 0 && (
              <div className="text-on-surface/50 font-mono text-sm italic py-4">No events logged yet.</div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Charts & Raw JSON Payload */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <HistoryCharts rows={collector.rows || []} />
          
          <h2 className="text-xl font-bold font-display tracking-tight flex items-center mt-2">
            Latest Extraction Payload
          </h2>
          <BentoCard className="flex-1 bg-[#1c1c17] text-[#f7f3eb] !p-6 overflow-hidden flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
              <span className="font-mono text-xs tracking-widest uppercase opacity-70">raw_data.json</span>
              <Badge variant="outline" className="border-white/20 text-white/70">
                {collector.latest_run ? new Date(collector.latest_run.started_at).toLocaleString() : 'N/A'}
              </Badge>
            </div>
            <pre className="font-mono text-sm leading-relaxed overflow-auto flex-1">
              {collector.rows && collector.rows.length > 0 
                ? JSON.stringify(collector.rows, null, 2) 
                : "// No payload data available for this run."}
            </pre>
          </BentoCard>
        </div>

      </div>
    </main>
  );
}
