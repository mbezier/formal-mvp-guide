import { useState } from "react";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id="request-demo" className="py-20 md:py-28 bg-accent/20">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4f98a3" }}>Early access</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Run your first AI-assisted VDD report this week.
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
            We're onboarding a small group of search funds and PE firms for early access. Apply below and we'll respond within 48 hours.
          </p>

          {submitted ? (
            <div className="p-4 rounded-xl border border-border bg-card text-sm">
              <p className="font-semibold mb-1" style={{ color: "hsl(152 60% 42%)" }}>You're on the list ✓</p>
              <p className="text-muted-foreground text-xs">We'll reach out to <strong>{email}</strong> within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="you@fund.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 px-5 rounded-full border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-full text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#4f98a3" }}
              >
                Get early access <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          <p className="text-[10px] text-muted-foreground mt-4">
            No credit card. AI runs locally. Your data never leaves your machine.
          </p>
        </div>
      </div>
    </section>
  );
};
