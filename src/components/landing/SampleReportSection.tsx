import { ArrowRight } from "lucide-react";

export const SampleReportSection = () => (
  <section className="py-20 md:py-28">
    <div className="container mx-auto px-4">
      <div className="max-w-[600px] mx-auto text-center">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#4f98a3" }}
        >
          See the output
        </p>
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">
          Download a sample VDD report.
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Generated from anonymized SaaS billing data. This is the exact output
          your IC will receive.
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-semibold border border-border hover:bg-accent transition-colors"
        >
          Download sample PDF <ArrowRight className="h-4 w-4" />
        </a>
        <p className="text-[10px] text-muted-foreground mt-4">
          Produced by the FinArrow engine · HEC Lausanne research methodology
        </p>
      </div>
    </div>
  </section>
);
