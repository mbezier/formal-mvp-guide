import { GraduationCap, BarChart3, Search } from "lucide-react";

const items = [
  {
    icon: GraduationCap,
    title: "HEC Lausanne",
    sub: "Master's research in Finance",
  },
  {
    icon: BarChart3,
    title: "Monte Carlo Simulation",
    sub: "Quantifying acquisition risk premiums",
  },
  {
    icon: Search,
    title: "The Lemon Premium",
    sub: "Adverse selection in SaaS M&A",
  },
];

export const AcademicSection = () => (
  <section id="methodology" className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="max-w-[700px] mx-auto">
        {/* Label */}
        <div className="text-center mb-8">
          <span
            className="inline-flex items-center text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              color: "hsl(38 80% 55%)",
              backgroundColor: "hsl(38 80% 55% / 0.1)",
              border: "1px solid hsl(38 80% 55% / 0.2)",
            }}
          >
            Research-backed methodology
          </span>
        </div>

        {/* Pull-quote */}
        <blockquote className="text-center text-lg md:text-xl font-medium italic leading-relaxed text-foreground/90 mb-12">
          "The risk engine powering FinArrow is built on original academic research
          into information asymmetries in SaaS acquisitions — the 'Lemon Premium'
          problem."
        </blockquote>

        {/* Divider */}
        <div className="border-t border-border mb-10" />

        {/* Three items */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {items.map((item) => (
            <div key={item.title} className="text-center sm:text-left">
              <item.icon className="h-5 w-5 text-muted-foreground mx-auto sm:mx-0 mb-2" />
              <p className="text-sm font-bold mb-0.5">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6" />

        {/* Footnote */}
        <p className="text-xs text-muted-foreground text-center">
          The same Monte Carlo engine used in this thesis runs inside every FinArrow report.
        </p>
      </div>
    </div>
  </section>
);
