import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Users, TrendingUp, TrendingDown, BarChart3, FileDown, ArrowLeft, X, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { KPICard } from "@/components/KPICard";
import { DDResult } from "@/lib/dd-types";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PIE_COLORS = [
  'hsl(var(--foreground))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--destructive))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
];

export default function DDDashboard() {
  const [result, setResult] = useState<DDResult | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const stored = sessionStorage.getItem('ddResult');
    if (!stored) {
      navigate('/analyze');
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      navigate('/analyze');
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const { summary, monthlyMRR, eventSummary, cleanTransactions, warnings } = result;

  // Revenue breakdown for pie chart
  const revenueBreakdownData = Object.entries(summary.revenueBreakdown).map(([name, value]) => ({
    name,
    value: Math.round(value * 100) / 100,
  }));

  // Event data for bar chart
  const eventData = [
    { event: 'New', count: eventSummary.new },
    { event: 'Renewal', count: eventSummary.renewal },
    { event: 'Resurrection', count: eventSummary.resurrection },
    { event: 'Overlap/Upsell', count: eventSummary.overlapUpsell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Top Actions */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate('/analyze')} className="border-foreground/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-6 p-4 border border-warning/30 rounded bg-warning/5">
            <p className="text-sm font-medium text-warning mb-1">⚠ Warnings</p>
            {warnings.map((w, i) => (
              <p key={i} className="text-sm text-muted-foreground">{w}</p>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Due Diligence Report</h1>
          <p className="text-muted-foreground">
            {summary.totalTransactions} transactions analyzed • {summary.duplicatesRemoved} duplicates removed
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Latest MRR"
            value={`$${summary.latestMRR.toLocaleString()}`}
            change={summary.mrrGrowthRate}
            icon={DollarSign}
            trend={summary.mrrGrowthRate > 0 ? 'up' : summary.mrrGrowthRate < 0 ? 'down' : 'neutral'}
            tooltipContent={{
              description: "Monthly Recurring Revenue derived from subscription normalization (amount / duration × 30.42 days).",
              formula: "Implied MRR = (Amount / Duration Days) × 30.42"
            }}
          />
          <KPICard
            title="Avg Implied MRR"
            value={`$${summary.avgImpliedMRR.toLocaleString()}`}
            icon={BarChart3}
            tooltipContent={{
              description: "Average implied MRR per subscription transaction.",
              formula: "Σ Implied MRR / # of MRR-bearing transactions"
            }}
          />
          <KPICard
            title="New Customers"
            value={String(eventSummary.new)}
            icon={Users}
            trend="up"
            tooltipContent={{
              description: "Number of first-time subscription events detected.",
              formula: "Transactions with no prior subscription end date"
            }}
          />
          <KPICard
            title="Renewals"
            value={String(eventSummary.renewal)}
            icon={RefreshCw}
            trend="up"
            tooltipContent={{
              description: "Subscriptions renewed within 30 days of the previous subscription ending.",
              formula: "Gap ≥ 0 and ≤ 30 days"
            }}
          />
        </div>

        <Tabs defaultValue="mrr" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="mrr">MRR Timeline</TabsTrigger>
            <TabsTrigger value="events">Event Analysis</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          {/* MRR Timeline */}
          <TabsContent value="mrr">
            <div className="bg-card border border-border rounded p-6">
              <h3 className="font-semibold mb-4">Implied MRR Over Time</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyMRR}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }} />
                  <Line type="monotone" dataKey="totalMRR" name="MRR" stroke="hsl(var(--foreground))" strokeWidth={2} dot={{ fill: 'hsl(var(--foreground))', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              {/* Customer count line */}
              <h3 className="font-semibold mb-4 mt-8">Active Customers Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyMRR}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }} />
                  <Line type="monotone" dataKey="customerCount" name="Customers" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: 'hsl(var(--success))', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* Event Analysis */}
          <TabsContent value="events">
            <div className="bg-card border border-border rounded p-6">
              <h3 className="font-semibold mb-4">Customer Lifecycle Events</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="event" tick={{ fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }} />
                  <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded">
                  <p className="text-2xl font-bold">{eventSummary.new}</p>
                  <p className="text-xs text-muted-foreground mt-1">New</p>
                </div>
                <div className="text-center p-4 bg-muted rounded">
                  <p className="text-2xl font-bold">{eventSummary.renewal}</p>
                  <p className="text-xs text-muted-foreground mt-1">Renewal</p>
                </div>
                <div className="text-center p-4 bg-muted rounded">
                  <p className="text-2xl font-bold">{eventSummary.resurrection}</p>
                  <p className="text-xs text-muted-foreground mt-1">Resurrection</p>
                </div>
                <div className="text-center p-4 bg-muted rounded">
                  <p className="text-2xl font-bold">{eventSummary.overlapUpsell}</p>
                  <p className="text-xs text-muted-foreground mt-1">Overlap/Upsell</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Revenue Breakdown */}
          <TabsContent value="revenue">
            <div className="bg-card border border-border rounded p-6">
              <h3 className="font-semibold mb-4">Revenue Classification</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={revenueBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {revenueBreakdownData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {revenueBreakdownData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <span className="font-mono text-sm">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transactions Table */}
          <TabsContent value="transactions">
            <div className="bg-card border border-border rounded p-6">
              <h3 className="font-semibold mb-4">Clean Transactions ({cleanTransactions.length})</h3>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Revenue Class</TableHead>
                      <TableHead className="text-right">Implied MRR</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead className="text-right">Gap (days)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cleanTransactions.slice(0, 100).map((tx, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{tx.customerId}</TableCell>
                        <TableCell className="text-xs">{tx.transactionDate}</TableCell>
                        <TableCell className="text-xs">{tx.transactionType}</TableCell>
                        <TableCell className="text-right font-mono text-xs">${tx.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            tx.revenueClass === 'Recurring' ? 'bg-success/20 text-success' :
                            tx.revenueClass === 'Contra-Revenue' ? 'bg-destructive/20 text-destructive' :
                            tx.revenueClass === 'NRR' ? 'bg-warning/20 text-warning' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {tx.revenueClass || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {tx.impliedMRR > 0 ? `$${tx.impliedMRR.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="text-xs">{tx.eventType || '-'}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{tx.gap !== null ? tx.gap : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {cleanTransactions.length > 100 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Showing first 100 of {cleanTransactions.length} transactions
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
