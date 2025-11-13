import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          <span className="text-xl font-bold tracking-tight">FinArrow</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <span className="text-muted-foreground">From spreadsheet chaos to investor clarity</span>
        </nav>
      </div>
    </header>
  );
};
