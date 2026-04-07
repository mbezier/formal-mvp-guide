import { Lock, Shield, Eye } from "lucide-react";

const points = [
  { icon: Lock, title: "Local-first AI", desc: "DeepSeek R1 / Llama 3.1 via Ollama. Zero external API calls for data processing." },
  { icon: Shield, title: "Anonymization layer", desc: "Customer IDs replaced with pseudonyms before any processing step." },
  { icon: Eye, title: "Full audit trail", desc: "Same input → same output, always. Every transformation is logged and reproducible." },
];

const flowNodes = [
  { label: "📁 Client billing export / FEC", style: "default" },
  { label: "🔒 Anonymization (local Python)", style: "teal" },
  { label: "✦ AI column mapping (Ollama — on-device)", style: "teal" },
  { label: "⬡ Deterministic SaaS engine (local)", style: "teal" },
  { label: "✓ IC Report PDF + data cube", style: "green" },
] as const;

export const PrivacySection = () => (
  <section id="privacy" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4f98a3" }}>Privacy by design</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Your client's data never leaves the room.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            While competitors upload your LP's data to OpenAI, FinArrow processes everything on your machine. No cloud. No third-party risk. No awkward NDA conversations.
          </p>

          <div className="space-y-6">
            {points.map((p) => (
              <div key={p.title} className="flex gap-4">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(152 60% 42% / 0.12)" }}>
                  <p.icon className="h-4 w-4" style={{ color: "hsl(152 60% 42%)" }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Flow diagram */}
        <div className="border border-border rounded-xl bg-card p-6 shadow-lg shadow-black/10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Data flow — what goes where</p>

          <div className="space-y-0">
            {flowNodes.map((node, i) => {
              const bg = node.style === "teal" ? "hsl(190 36% 47% / 0.1)" : node.style === "green" ? "hsl(152 60% 42% / 0.1)" : undefined;
              const border = node.style === "teal" ? "hsl(190 36% 47% / 0.25)" : node.style === "green" ? "hsl(152 60% 42% / 0.25)" : undefined;
              return (
                <div key={i}>
                  <div
                    className="px-4 py-3 rounded-lg text-xs font-medium border"
                    style={{ backgroundColor: bg, borderColor: border || "hsl(var(--border))" }}
                  >
                    {node.label}
                  </div>
                  {i < flowNodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <span className="text-muted-foreground text-xs">↓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Separator */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">never transmitted externally</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Blocked */}
          <div className="px-4 py-3 rounded-lg text-xs font-medium border opacity-40" style={{ borderColor: "hsl(0 72% 51% / 0.3)", backgroundColor: "hsl(0 72% 51% / 0.05)" }}>
            <span className="line-through">✗ OpenAI / Google Cloud / External servers</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);
