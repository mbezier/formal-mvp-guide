import { useState } from "react";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:maxime.bezier@unil.ch?subject=FinArrow%20Early%20Access&body=Hi%2C%0A%0AI%27d%20like%20early%20access%20to%20FinArrow.%0A%0AEmail%3A%20${encodeURIComponent(email)}%0AMy%20role%3A%20%0AFund%20%2F%20firm%3A%20%0A%0AThanks!`;
    window.location.href = mailto;
  };

  return (
    <section id="request-demo" className="py-20 md:py-28 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#4f98a3" }}
          >
            Early access
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Run your first AI-assisted VDD report this week.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
            We're onboarding a small group of search funds and PE firms for early
            access. Tell us about your use case and we'll respond within 48 hours.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
          >
            <input
              type="email"
              required
              placeholder="you@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 px-5 rounded-full border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-full text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2 transition-opacity hover:opacity-90 whitespace-nowrap bg-primary"
            >
              Get early access <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-[10px] text-muted-foreground">
            No credit card. AI runs locally. Your data never leaves your machine.
          </p>
        </div>
      </div>
    </section>
  );
};
