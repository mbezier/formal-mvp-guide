import { TrendingUp, Users, AlertTriangle, ShieldCheck, Sparkles, Layers } from "lucide-react";

const metrics = [
  {
    icon: TrendingUp, color: "#4f98a3",
    title: "Revenue Engine",
    desc: "MRR/ARR computation, ARR bridge waterfall, and revenue quality split (recurring vs. one-off).",
    tags: ["MRR/ARR", "ARR Bridge", "Revenue split"],
  },
  {
    icon: Users, color: "hsl(38 80% 55%)",
    title: "Customer Retention",
    desc: "Vintage cohort analysis with NRR/GDR at 12, 24, and 36 months. Logo retention tracking.",
    tags: ["NRR/GDR", "Cohorts", "Logo retention"],
  },
  {
    icon: AlertTriangle, color: "hsl(0 72% 51%)",
    title: "Concentration & Risk Flags",
    desc: "Top-1/5/10 customer share, one-off revenue flagging, and Lemon Premium proxy scoring.",
    tags: ["Concentration", "FX risk", "Lemon flags"],
  },
  {
    icon: ShieldCheck, color: "hsl(152 60% 42%)",
    title: "Data Quality Audit",
    desc: "A–F letter grade on data completeness, duplicate detection, and full audit trail export.",
    tags: ["A–F grade", "Completeness", "Audit trail"],
  },
  {
    icon: Sparkles, color: "#4f98a3",
    title: "AI Narrative Layer",
    desc: "Local LLM drafts the Risk chapter for your IC memo. Every claim is backed by data.",
    tags: ["IC memo draft", "Local LLM", "Flag explanations"],
  },
  {
    icon: Layers, color: "hsl(38 80% 55%)",
    title: "Data Cube Export",
    desc: "Clean CSV with standardized schema. Drop it into any model or open in Excel immediately.",
    tags: ["CSV export", "Standard schema", "Excel-ready"],
  },
];

export const MetricsSection = () => (
  <section id="metrics" className="py-20 md:py-28 bg-accent/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Every metric that matters at IC.</h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {metrics.map((m) => (
          <div
            key={m.title}
            className="border border-border rounded-xl bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-black/10"
          >
            <div className="h-9 w-9 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${m.color}18` }}>
              <m.icon className="h-4 w-4" style={{ color: m.color }} />
            </div>
            <h3 className="text-sm font-bold mb-2">{m.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{m.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {m.tags.map((t) => (
                <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
