import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto w-full animate-pulse">
      <Link href="/" className="inline-flex items-center gap-2 text-on-surface/40 mb-8 font-mono text-sm uppercase tracking-widest">
        <ArrowLeft className="h-4 w-4" />
        Back to Console
      </Link>
      
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-10 w-64 bg-on-surface/10 rounded-md"></div>
          <div className="h-6 w-24 bg-on-surface/10 rounded-full"></div>
        </div>
        <div className="h-4 w-96 bg-on-surface/10 rounded-md"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[400px] w-full border-2 border-on-surface/10 bg-surface-container-lowest rounded-xl"></div>
        </div>
        <div>
          <div className="h-6 w-32 bg-on-surface/10 rounded-md mb-6"></div>
          <div className="space-y-4 border-l-2 border-on-surface/10 pl-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative">
                <div className="absolute w-3 h-3 bg-on-surface/20 rounded-full -left-[1.9rem] top-1"></div>
                <div className="h-4 w-24 bg-on-surface/10 rounded-md mb-2"></div>
                <div className="h-3 w-48 bg-on-surface/10 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
