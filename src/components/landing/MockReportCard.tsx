import { Lock, Sparkles } from "lucide-react";

export const MockReportCard = () => {
  const sparkline = [30, 35, 33, 40, 42, 50, 55, 60, 58, 65, 72, 80];

  return (
    <div className="relative rounded-xl border border-border bg-card p-6 shadow-2xl shadow-black/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">FinArrow VDD Report</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'hsl(152 60% 42% / 0.15)', color: 'hsl(152 60% 42%)' }}>
            A — 100% Data Quality
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-accent px-2.5 py-1.5 rounded-full">
          <Lock className="h-3 w-3" />
          Local AI · No upload
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "MRR", value: "€216k", color: "#4f98a3" },
          { label: "NRR", value: "118%", color: "hsl(152 60% 42%)" },
          { label: "Top-1", value: "5.8%", color: "hsl(38 80% 55%)" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-accent/50 rounded-lg p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{kpi.label}</p>
            <p className="text-lg font-extrabold font-heading" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      <div className="mb-5 h-16 relative overflow-hidden rounded-lg bg-accent/30 p-2">
        <svg viewBox="0 0 120 40" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f98a3" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f98a3" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M0,${40 - sparkline[0] / 2} ${sparkline.map((v, i) => `L${(i * 120) / (sparkline.length - 1)},${40 - v / 2}`).join(" ")} L120,40 L0,40Z`}
            fill="url(#sparkFill)"
          />
          <polyline
            points={sparkline.map((v, i) => `${(i * 120) / (sparkline.length - 1)},${40 - v / 2}`).join(" ")}
            fill="none"
            stroke="#4f98a3"
            strokeWidth="1.5"
          />
        </svg>
        <p className="absolute top-2 left-3 text-[10px] text-muted-foreground">MRR Growth Trend</p>
      </div>

      {/* Flags */}
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(152 60% 42%)" }} />
          <div>
            <p className="text-sm font-semibold">NRR healthy — expansion detected</p>
            <p className="text-xs text-muted-foreground">Net revenue retention above 110% with consistent seat-based upsells across top cohorts.</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: "hsl(38 80% 55%)" }} />
          <div>
            <p className="text-sm font-semibold">Hidden churn risk — one-off share 19%</p>
            <p className="text-xs text-muted-foreground">Non-recurring fees represent 19% of trailing-12-month revenue. Investigate professional services mix.</p>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-white shadow-lg" style={{ backgroundColor: "#4f98a3" }}>
        <Sparkles className="h-3 w-3" />
        AI-assisted · local model
      </div>
    </div>
  );
};
