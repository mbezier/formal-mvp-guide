import { ArrowRight, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          <span className="text-xl font-bold tracking-tight">FinArrow</span>
        </Link>
        <nav className="flex items-center gap-4">
          <span className="hidden md:inline text-sm text-muted-foreground">From spreadsheet chaos to investor clarity</span>
          {user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-1" />
              Sign out
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
