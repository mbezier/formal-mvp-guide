import { Upload, Sparkles, Activity, Download } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload any billing export",
    desc: "Stripe, Chargebee, custom CSV, or French FEC. We parse anything.",
    tag: "🔒 Stays on your machine",
    tagColor: "hsl(152 60% 42%)",
  },
  {
    num: "02",
    icon: Sparkles,
    title: "AI maps & cleans — locally",
    desc: "DeepSeek R1 or Llama 3.1 via Ollama detects columns and normalizes schema.",
    tag: "✦ AI · on-device",
    tagColor: "#4f98a3",
  },
  {
    num: "03",
    icon: Activity,
    title: "Deterministic risk engine",
    desc: "Monte Carlo simulations, cohort analysis, and concentration scoring. No randomness.",
    tag: "⬡ MC simulation · HEC research",
    tagColor: "hsl(38 80% 55%)",
  },
  {
    num: "04",
    icon: Download,
    title: "IC memo + clean data cube",
    desc: "One-click PDF report with AI narrative, plus a structured Excel data cube.",
    tag: "✦ AI narrative + Excel",
    tagColor: "#4f98a3",
  },
];

export const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 md:py-28 bg-accent/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          From messy export to IC memo. Fully auditable. No black box.
        </h2>
        <p className="text-muted-foreground">
          Four deterministic steps with AI at each end — parsing and narrating. Everything in between is pure math.
        </p>
      </div>

      <div className="max-w-5xl mx-auto border border-border rounded-xl overflow-hidden bg-card">
        <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          {steps.map((s) => (
            <div key={s.num} className="p-6 flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4f98a3" }}>
                Step {s.num}
              </p>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "hsl(190 36% 47% / 0.12)" }}>
                <s.icon className="h-5 w-5" style={{ color: "#4f98a3" }} />
              </div>
              <h3 className="text-sm font-bold mb-2">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{s.desc}</p>
              <span
                className="inline-flex self-start items-center text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${s.tagColor}15`, color: s.tagColor, border: `1px solid ${s.tagColor}30` }}
              >
                {s.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
