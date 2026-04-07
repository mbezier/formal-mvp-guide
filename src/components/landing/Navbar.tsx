import { useState, useEffect } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

export const Navbar = () => {
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const links = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Privacy", href: "#privacy" },
    { label: "Metrics", href: "#metrics" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map((l) => (
            <button key={l.href} onClick={() => scrollTo(l.href)} className="text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={() => scrollTo("#request-demo")}
            className="hidden md:inline-flex h-9 px-5 items-center rounded-full text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#4f98a3" }}
          >
            Request Demo
          </button>

          {/* Mobile menu toggle */}
          <button className="md:hidden h-9 w-9 flex items-center justify-center" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <button key={l.href} onClick={() => scrollTo(l.href)} className="text-sm text-left py-2 text-muted-foreground hover:text-foreground">
              {l.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("#request-demo")}
            className="mt-2 h-11 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: "#4f98a3" }}
          >
            Request Demo
          </button>
        </div>
      )}
    </nav>
  );
};
