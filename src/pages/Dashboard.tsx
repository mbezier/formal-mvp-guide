import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Users, TrendingDown, Gauge, Ratio, UserCircle, FileDown, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { KPICard } from "@/components/KPICard";
import { FinancialData, KPIMetrics, calculateKPIs } from "@/lib/excel-utils";
import { exportToPDF } from "@/lib/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Dashboard() {
  const [data, setData] = useState<FinancialData[]>([]);
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedData = sessionStorage.getItem('financialData');
    if (!storedData) {
      // Load demo data if no data uploaded
      setIsDemo(true);
      const demoData: FinancialData[] = [
       { date: '2024-01-01', revenue: 45000, operatingExpenses: 35000, customerCount: 120, churnRate: 5, cashIn: 42000, cashOut: 55000, cashBalance: 180000 },
       { date: '2024-02-01', revenue: 48000, operatingExpenses: 38000, customerCount: 135, churnRate: 4, cashIn: 46000, cashOut: 52000, cashBalance: 174000 },
       { date: '2024-03-01', revenue: 52000, operatingExpenses: 40000, customerCount: 150, churnRate: 6, cashIn: 50000, cashOut: 54000, cashBalance: 170000 },
       { date: '2024-04-01', revenue: 55000, operatingExpenses: 42000, customerCount: 165, churnRate: 5, cashIn: 53000, cashOut: 51000, cashBalance: 172000 },
       { date: '2024-05-01', revenue: 61000, operatingExpenses: 45000, customerCount: 185, churnRate: 7, cashIn: 58000, cashOut: 53000, cashBalance: 177000 },
       { date: '2024-06-01', revenue: 68000, operatingExpenses: 48000, customerCount: 210, churnRate: 6, cashIn: 65000, cashOut: 55000, cashBalance: 187000 },
      ];
      setData(demoData);
      try {
        const calculatedKPIs = calculateKPIs(demoData);
        setKpis(calculatedKPIs);
      } catch (error) {
        console.error('Failed to calculate demo KPIs:', error);
      }
      return;
    }

    const parsedData: FinancialData[] = JSON.parse(storedData);
    setData(parsedData);
    
    try {
      const calculatedKPIs = calculateKPIs(parsedData);
      setKpis(calculatedKPIs);
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "Failed to calculate KPIs from your data",
        variant: "destructive",
      });
    }
  }, [navigate, toast]);

  const handleExportPDF = () => {
    if (!kpis) return;
    
    try {
      exportToPDF(kpis);
      toast({
        title: "PDF Exported",
        description: "Your investor report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  if (!kpis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

   // Calculate Cash Zero Date from runway months
   const getCashZeroDate = (runwayMonths: number) => {
     const today = new Date();
     const cashZeroDate = new Date(today);
     cashZeroDate.setMonth(today.getMonth() + Math.floor(runwayMonths));
     return cashZeroDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
   };

   // Risk flags
   const isChurnRisk = kpis.churnRate > 1;
   const isBurnRisk = kpis.burnRate > 0; // Positive burn = spending more than earning

  // Prepare chart data
  const chartData = data.map((item) => {
    // Excel dates might be serial numbers, strings, or Date objects
    let date: Date;
    if (typeof item.date === 'number') {
      // Excel serial date number (days since 1900-01-01)
      date = new Date((item.date - 25569) * 86400 * 1000);
    } else {
      date = new Date(item.date);
    }
    
    // Ensure we have a valid date
    if (isNaN(date.getTime())) {
      date = new Date();
    }
    
    return {
      month: `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear().toString().slice(-2)}`,
      mrr: item.revenue,
      burn: item.cashOut - item.cashIn,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      {isDemo && showDemoBanner && (
       <div 
         className="sticky top-0 z-50 border-b px-4 py-3"
         style={{ 
           backgroundColor: 'hsl(142 100% 50% / 0.1)', 
           borderColor: 'hsl(142 100% 50% / 0.3)' 
         }}
       >
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-sm text-foreground">
              👀 You are viewing a <span className="font-semibold">Demo Dataset</span>. Real-time processing is reserved for Beta Partners.
            </p>
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
               className="text-black font-medium"
               style={{ backgroundColor: 'hsl(142 100% 50%)' }}
               onClick={() => window.location.href = 'mailto:maxime.bezier@unil.ch?subject=FinArrow Beta Access Request'}
              >
                Get Beta Access
              </Button>
              <button 
                onClick={() => setShowDemoBanner(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Top Actions */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-foreground/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-3">
            {isDemo && (
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      disabled
                      className="border-foreground/20 opacity-50 cursor-not-allowed"
                    >
                      Upload CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Available in Full Version</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            )}
            <Button
              onClick={handleExportPDF}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Dashboard
            {isDemo && <span className="ml-3 text-sm font-normal text-neon">(Demo)</span>}
          </h1>
          <p className="text-muted-foreground">Key performance indicators for your SaaS business</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="MRR"
            value={`$${kpis.mrr.toLocaleString()}`}
            change={kpis.mrrChange}
            icon={DollarSign}
            trend={kpis.mrrChange > 0 ? 'up' : kpis.mrrChange < 0 ? 'down' : 'neutral'}
             badge={{
               label: isDemo ? '⚠️ Manual Entry' : '✓ Stripe Verified',
               variant: isDemo ? 'warning' : 'success'
             }}
            tooltipContent={{
              description: "Monthly Recurring Revenue - the predictable revenue your business generates each month from subscriptions.",
              formula: "Total Monthly Subscription Revenue"
            }}
          />
          <KPICard
            title="CAC"
            value={`$${kpis.cac.toFixed(2)}`}
            change={kpis.cacChange}
            icon={Users}
            trend={kpis.cacChange < 0 ? 'up' : kpis.cacChange > 0 ? 'down' : 'neutral'}
            tooltipContent={{
              description: "Customer Acquisition Cost - the average cost to acquire a new customer. Lower is better.",
              formula: "Operating Expenses / Customer Count"
            }}
          />
          <KPICard
            title="Churn Rate"
            value={`${kpis.churnRate.toFixed(1)}%`}
            change={kpis.churnChange}
            icon={TrendingDown}
             trend={isChurnRisk ? 'down' : kpis.churnChange < 0 ? 'up' : 'neutral'}
             isRisk={isChurnRisk}
            tooltipContent={{
               description: "The percentage of customers who stop their subscription monthly. >1% monthly = >12% annual churn (risky). >5% = business at risk.",
              formula: "Churned Customers / Total Customers × 100"
            }}
          />
          <KPICard
            title="Burn Rate"
            value={`$${kpis.burnRate.toLocaleString()}`}
            change={kpis.burnRateChange}
            icon={TrendingDown}
             trend={isBurnRisk ? 'down' : 'up'}
             isRisk={isBurnRisk}
            tooltipContent={{
               description: "Net Burn Rate - positive means spending more than earning (cash outflow). Negative burn means cash positive.",
              formula: "Cash Out - Cash In"
            }}
          />
          <KPICard
             title="Cash Zero Date"
             value={getCashZeroDate(kpis.runwayMonths)}
            icon={Gauge}
            trend={kpis.runwayMonths > 6 ? 'up' : kpis.runwayMonths < 3 ? 'down' : 'neutral'}
             isRisk={kpis.runwayMonths < 6}
            tooltipContent={{
               description: "Projected date when cash hits zero at current burn rate. Earlier dates = higher risk.",
               formula: `Today + ${kpis.runwayMonths.toFixed(1)} months runway`
            }}
          />
          <KPICard
            title="LTV/CAC"
            value={kpis.ltvCacRatio.toFixed(2)}
            change={kpis.ltvCacChange}
            icon={Ratio}
            trend={kpis.ltvCacRatio > 3 ? 'up' : kpis.ltvCacRatio < 2 ? 'down' : 'neutral'}
            tooltipContent={{
              description: "Lifetime Value to Customer Acquisition Cost ratio. A ratio > 3 indicates a healthy business model.",
              formula: "Customer Lifetime Value / CAC"
            }}
          />
          <KPICard
            title="ARPU"
            value={`$${kpis.arpu.toFixed(2)}`}
            change={kpis.arpuChange}
            icon={UserCircle}
            trend={kpis.arpuChange > 0 ? 'up' : kpis.arpuChange < 0 ? 'down' : 'neutral'}
            tooltipContent={{
              description: "Average Revenue Per User - the average monthly revenue generated per customer. Higher ARPU means more revenue from each customer.",
              formula: "MRR / Total Customers"
            }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* MRR Chart */}
          <div className="bg-card border border-border rounded p-6">
            <h3 className="font-semibold mb-4">MRR Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--border))"
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '4px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="hsl(var(--foreground))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--foreground))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Burn Rate Chart */}
          <div className="bg-card border border-border rounded p-6">
            <h3 className="font-semibold mb-4">Net Burn Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--border))"
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '4px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="burn" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics Table */}
        <div className="bg-card border border-border rounded p-6">
          <h3 className="font-semibold mb-4">All Metrics</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="text-right">MoM Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Monthly Recurring Revenue</TableCell>
                <TableCell className="text-right">${kpis.mrr.toLocaleString()}</TableCell>
                <TableCell className={`text-right ${kpis.mrrChange > 0 ? 'text-success' : kpis.mrrChange < 0 ? 'text-destructive' : ''}`}>
                  {kpis.mrrChange > 0 ? '+' : ''}{kpis.mrrChange.toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Customer Acquisition Cost</TableCell>
                <TableCell className="text-right">${kpis.cac.toFixed(2)}</TableCell>
                <TableCell className={`text-right ${kpis.cacChange < 0 ? 'text-success' : kpis.cacChange > 0 ? 'text-destructive' : ''}`}>
                  {kpis.cacChange > 0 ? '+' : ''}{kpis.cacChange.toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Churn Rate</TableCell>
                 <TableCell className={`text-right ${isChurnRisk ? 'text-destructive font-semibold' : ''}`}>{kpis.churnRate.toFixed(1)}%</TableCell>
                <TableCell className={`text-right ${kpis.churnChange < 0 ? 'text-success' : kpis.churnChange > 0 ? 'text-destructive' : ''}`}>
                  {kpis.churnChange > 0 ? '+' : ''}{kpis.churnChange.toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Net Burn Rate</TableCell>
                 <TableCell className={`text-right ${isBurnRisk ? 'text-destructive font-semibold' : 'text-success'}`}>${kpis.burnRate.toLocaleString()}</TableCell>
                <TableCell className={`text-right ${kpis.burnRateChange < 0 ? 'text-success' : kpis.burnRateChange > 0 ? 'text-destructive' : ''}`}>
                  {kpis.burnRateChange > 0 ? '+' : ''}{kpis.burnRateChange.toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                 <TableCell className="font-medium">Cash Zero Date</TableCell>
                 <TableCell className={`text-right ${kpis.runwayMonths < 6 ? 'text-destructive font-semibold' : ''}`}>{getCashZeroDate(kpis.runwayMonths)}</TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">LTV/CAC Ratio</TableCell>
                <TableCell className="text-right">{kpis.ltvCacRatio.toFixed(2)}</TableCell>
                <TableCell className={`text-right ${kpis.ltvCacChange > 0 ? 'text-success' : kpis.ltvCacChange < 0 ? 'text-destructive' : ''}`}>
                  {kpis.ltvCacChange > 0 ? '+' : ''}{kpis.ltvCacChange.toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ARPU</TableCell>
                <TableCell className="text-right">${kpis.arpu.toFixed(2)}</TableCell>
                <TableCell className={`text-right ${kpis.arpuChange > 0 ? 'text-success' : kpis.arpuChange < 0 ? 'text-destructive' : ''}`}>
                  {kpis.arpuChange > 0 ? '+' : ''}{kpis.arpuChange.toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
