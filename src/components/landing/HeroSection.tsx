import { Check } from "lucide-react";
import { MockReportCard } from "./MockReportCard";

export const HeroSection = () => {
  const trustItems = [
    "AI runs on-device (Ollama)",
    "Deterministic MC engine",
    "GDPR-compliant by design",
  ];

  return (
    <section className="container mx-auto px-4 py-20 md:py-28">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-accent/50 text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "hsl(152 60% 42%)" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "hsl(152 60% 42%)" }} />
            </span>
            AI-Native · Local Processing · Zero Cloud Exposure
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            SaaS Due Diligence.
            <br />
            <span style={{ color: "#4f98a3" }}>In 4 hours,</span>
            <br />
            not 4 days.
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
            FinArrow combines a deterministic SaaS risk engine with locally-run AI to deliver IC-ready VDD reports — without sending your client's data to any cloud.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => document.querySelector("#request-demo")?.scrollIntoView({ behavior: "smooth" })}
              className="h-11 px-6 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#4f98a3" }}
            >
              Request Demo
            </button>
            <button
              onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="h-11 px-6 rounded-full text-sm font-semibold border border-border hover:bg-accent transition-colors"
            >
              See how it works
            </button>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(152 60% 42%)" }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Mock Report */}
        <div className="relative">
          <MockReportCard />
        </div>
      </div>
    </section>
  );
};
