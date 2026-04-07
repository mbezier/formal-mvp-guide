import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  const mailto =
    "mailto:maxime.bezier@unil.ch?subject=FinArrow%20Demo%20Request&body=Hi%2C%0A%0AI%27d%20like%20to%20request%20a%20demo%20of%20FinArrow.%0A%0AMy%20role%3A%20%0AFund%20%2F%20firm%3A%20%0A%0AThanks!";

  return (
    <section id="request-demo" className="py-20 md:py-28 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4f98a3" }}>
            Early access
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Run your first AI-assisted VDD report this week.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
            We're onboarding a small group of search funds and PE firms for early access. Tell us about your use case
            and we'll respond within 48 hours.
          </p>

          <a
            href={mailto}
            className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#4f98a3" }}
          >
            Request Demo <ArrowRight className="h-4 w-4" />
          </a>

          <p className="text-[10px] text-muted-foreground mt-4">
            No credit card. AI runs locally. Your data never leaves your machine.
          </p>
        </div>
      </div>
    </section>
  );
};
