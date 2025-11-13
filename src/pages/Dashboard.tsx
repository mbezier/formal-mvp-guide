import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Users, TrendingDown, Gauge, Ratio, UserCircle, FileDown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { KPICard } from "@/components/KPICard";
import { FinancialData, KPIMetrics, calculateKPIs } from "@/lib/excel-utils";
import { exportToPDF } from "@/lib/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Dashboard() {
  const [data, setData] = useState<FinancialData[]>([]);
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedData = sessionStorage.getItem('financialData');
    if (!storedData) {
      navigate('/');
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

  // Prepare chart data
  const chartData = data.map((item) => ({
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    mrr: item.revenue,
    burn: item.cashOut - item.cashIn,
  }));

  return (
    <div className="min-h-screen bg-background">
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
            Back to Upload
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
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
          />
          <KPICard
            title="CAC"
            value={`$${kpis.cac.toFixed(2)}`}
            change={kpis.cacChange}
            icon={Users}
            trend={kpis.cacChange < 0 ? 'up' : kpis.cacChange > 0 ? 'down' : 'neutral'}
          />
          <KPICard
            title="Churn Rate"
            value={`${kpis.churnRate.toFixed(1)}%`}
            change={kpis.churnChange}
            icon={TrendingDown}
            trend={kpis.churnChange < 0 ? 'up' : kpis.churnChange > 0 ? 'down' : 'neutral'}
          />
          <KPICard
            title="Burn Rate"
            value={`$${kpis.burnRate.toLocaleString()}`}
            change={kpis.burnRateChange}
            icon={TrendingDown}
            trend={kpis.burnRateChange < 0 ? 'up' : kpis.burnRateChange > 0 ? 'down' : 'neutral'}
          />
          <KPICard
            title="Runway"
            value={`${kpis.runwayMonths.toFixed(1)} mo`}
            icon={Gauge}
            trend={kpis.runwayMonths > 6 ? 'up' : kpis.runwayMonths < 3 ? 'down' : 'neutral'}
          />
          <KPICard
            title="LTV/CAC"
            value={kpis.ltvCacRatio.toFixed(2)}
            change={kpis.ltvCacChange}
            icon={Ratio}
            trend={kpis.ltvCacRatio > 3 ? 'up' : kpis.ltvCacRatio < 2 ? 'down' : 'neutral'}
          />
          <KPICard
            title="ARPU"
            value={`$${kpis.arpu.toFixed(2)}`}
            change={kpis.arpuChange}
            icon={UserCircle}
            trend={kpis.arpuChange > 0 ? 'up' : kpis.arpuChange < 0 ? 'down' : 'neutral'}
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
                <TableCell className="text-right">{kpis.churnRate.toFixed(1)}%</TableCell>
                <TableCell className={`text-right ${kpis.churnChange < 0 ? 'text-success' : kpis.churnChange > 0 ? 'text-destructive' : ''}`}>
                  {kpis.churnChange > 0 ? '+' : ''}{kpis.churnChange.toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Net Burn Rate</TableCell>
                <TableCell className="text-right">${kpis.burnRate.toLocaleString()}</TableCell>
                <TableCell className={`text-right ${kpis.burnRateChange < 0 ? 'text-success' : kpis.burnRateChange > 0 ? 'text-destructive' : ''}`}>
                  {kpis.burnRateChange > 0 ? '+' : ''}{kpis.burnRateChange.toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Runway</TableCell>
                <TableCell className="text-right">{kpis.runwayMonths.toFixed(1)} months</TableCell>
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
