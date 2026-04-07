import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t border-border py-8">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <Logo />
      <p className="text-xs text-muted-foreground text-center">
        © 2026 FinArrow · AI-native SaaS Due Diligence · Built in France 🇫🇷
      </p>
      <p className="text-xs text-muted-foreground">
        AI runs locally · GDPR by design
      </p>
    </div>
  </footer>
);
