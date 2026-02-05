 import { Link } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { DollarSign, Users, TrendingDown } from "lucide-react";
 
 export default function LandingPage() {
   return (
     <div className="min-h-screen bg-background dark">
       {/* Force dark mode */}
       <style>{`
         :root {
           --background: 0 0% 5%;
           --foreground: 0 0% 98%;
           --card: 0 0% 8%;
           --card-foreground: 0 0% 98%;
           --popover: 0 0% 5%;
           --popover-foreground: 0 0% 98%;
           --primary: 0 0% 98%;
           --primary-foreground: 0 0% 5%;
           --secondary: 0 0% 12%;
           --secondary-foreground: 0 0% 98%;
           --muted: 0 0% 12%;
           --muted-foreground: 0 0% 60%;
           --accent: 0 0% 15%;
           --accent-foreground: 0 0% 98%;
           --border: 0 0% 20%;
           --input: 0 0% 20%;
           --ring: 0 0% 80%;
         }
       `}</style>
 
       {/* Header */}
       <header className="border-b border-border/40">
         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
           <Link to="/" className="text-xl font-bold tracking-tight">
             FinArrow
           </Link>
           <nav className="flex items-center gap-6 text-sm">
             <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
               Login
             </Link>
           </nav>
         </div>
       </header>
 
       {/* Hero Section */}
       <section className="container mx-auto px-4 py-24 md:py-32">
         <div className="max-w-4xl mx-auto text-center">
           <Badge className="mb-6 bg-neon/10 text-neon border-neon/30 hover:bg-neon/20">
             🔬 Research Project @ UNIL — Beta Access
           </Badge>
           
           <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
             Don't Trust the Dashboard.
             <br />
             <span className="text-neon">Verify the Raw Data.</span>
           </h1>
           
           <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
             Automated SaaS Due Diligence for Search Funds. We ingest Stripe exports & General Ledgers 
             to reveal the real Unit Economics (Churn, MRR, CAC) in seconds.
           </p>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button 
               asChild
               size="lg" 
               className="bg-neon text-neon-foreground hover:bg-neon/90 font-semibold px-8"
             >
               <Link to="/analyze">Analyze a Deal</Link>
             </Button>
             <Button 
               asChild
               variant="outline" 
               size="lg"
               className="border-border hover:bg-accent"
             >
               <Link to="/dashboard">View Sample Report</Link>
             </Button>
           </div>
         </div>
       </section>
 
       {/* Problem/Solution Grid */}
       <section className="container mx-auto px-4 py-16">
         <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
           <Card className="bg-card border-border/50 hover:border-neon/30 transition-colors">
             <CardContent className="p-6">
               <div className="h-12 w-12 rounded bg-neon/10 flex items-center justify-center mb-4">
                 <DollarSign className="h-6 w-6 text-neon" />
               </div>
               <h3 className="text-lg font-semibold mb-2">Revenue Quality</h3>
               <p className="text-muted-foreground text-sm">
                 Detect non-recurring fees hiding in ARR. Separate professional services from true SaaS revenue.
               </p>
             </CardContent>
           </Card>
 
           <Card className="bg-card border-border/50 hover:border-neon/30 transition-colors">
             <CardContent className="p-6">
               <div className="h-12 w-12 rounded bg-neon/10 flex items-center justify-center mb-4">
                 <Users className="h-6 w-6 text-neon" />
               </div>
               <h3 className="text-lg font-semibold mb-2">Cohort Reality</h3>
               <p className="text-muted-foreground text-sm">
                 Rebuild retention cohorts from raw billing data. Spot churn spikes the founder isn't showing you.
               </p>
             </CardContent>
           </Card>
 
           <Card className="bg-card border-border/50 hover:border-neon/30 transition-colors">
             <CardContent className="p-6">
               <div className="h-12 w-12 rounded bg-neon/10 flex items-center justify-center mb-4">
                 <TrendingDown className="h-6 w-6 text-neon" />
               </div>
               <h3 className="text-lg font-semibold mb-2">The Lemon Premium</h3>
               <p className="text-muted-foreground text-sm">
                 Quantify risk using Monte Carlo simulations on cash flow volatility.
               </p>
             </CardContent>
           </Card>
         </div>
       </section>
 
       {/* Visual Showcase */}
       <section className="container mx-auto px-4 py-16">
         <div className="max-w-4xl mx-auto">
           <div className="relative">
             {/* MacBook Frame */}
             <div className="bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-t-xl p-2 pt-4">
               <div className="flex items-center gap-2 mb-3 px-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/80" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                 <div className="w-3 h-3 rounded-full bg-green-500/80" />
               </div>
               <div className="bg-zinc-900 rounded overflow-hidden aspect-video flex items-center justify-center">
                 {/* Dashboard Preview */}
                 <div className="w-full h-full p-6 bg-background">
                   <div className="text-sm text-muted-foreground mb-4">Dashboard Preview</div>
                   <div className="text-lg font-semibold mb-6">Adjusted EBITDA vs. Reported EBITDA</div>
                   <div className="h-40 flex items-end gap-3 px-4">
                     {[40, 55, 45, 70, 60, 85, 75, 90].map((height, i) => (
                       <div key={i} className="flex-1 flex gap-1 h-full items-end">
                         <div 
                           className="flex-1 rounded-t" 
                           style={{ height: `${height * 1.5}px`, backgroundColor: 'hsl(142 100% 50% / 0.6)' }}
                         />
                         <div 
                           className="flex-1 bg-muted rounded-t"
                           style={{ height: `${height * 1.05}px` }}
                         />
                       </div>
                     ))}
                   </div>
                   <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(142 100% 50% / 0.6)' }} />
                       <span>Adjusted EBITDA</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-muted rounded" />
                       <span>Reported EBITDA</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             {/* MacBook Base */}
             <div className="bg-gradient-to-b from-zinc-800 to-zinc-700 h-4 rounded-b-lg" />
             <div className="bg-zinc-600 h-1 mx-16 rounded-b" />
           </div>
         </div>
       </section>
 
       {/* Footer */}
       <footer className="border-t border-border/40 mt-16">
         <div className="container mx-auto px-4 py-8">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="text-sm text-muted-foreground">
               © 2025 FinArrow. A UNIL Research Project.
             </div>
             <nav className="flex items-center gap-6 text-sm text-muted-foreground">
               <a href="#" className="hover:text-foreground transition-colors">Research</a>
               <a href="#" className="hover:text-foreground transition-colors">Contact</a>
               <Link to="/dashboard" className="hover:text-foreground transition-colors">Login</Link>
             </nav>
           </div>
         </div>
       </footer>
     </div>
   );
 }