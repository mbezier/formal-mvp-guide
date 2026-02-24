import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ===== TYPES =====
interface RawTransaction {
  customerId: string;
  transactionDate: string;
  amount: number;
  transactionType: string;
  startDate: string;
  endDate: string;
}

interface ProcessedTransaction extends RawTransaction {
  revenueClass: string | null;
  duration: number;
  impliedMRR: number;
  transactionHash: string;
  prevEnd: string | null;
  gap: number | null;
  eventType: string | null;
}

// ===== MODULE 1: Sanitation & Deduplication =====
function cleanAmount(val: string | number): number {
  if (typeof val === 'number') return val;
  return parseFloat(String(val).replace(/€/g, '').trim().replace(/,/g, '.')) || 0;
}

function cleanTransactionType(val: string): string {
  return String(val).trim().replace(/\b\w/g, c => c.toUpperCase());
}

function hashString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return String(hash);
}

function sanitizeAndDedup(rows: RawTransaction[]): { cleaned: RawTransaction[]; duplicatesRemoved: number } {
  const cleaned = rows.map(r => ({
    ...r,
    amount: cleanAmount(r.amount as any),
    transactionType: cleanTransactionType(r.transactionType),
  }));

  const seen = new Set<string>();
  const deduped: RawTransaction[] = [];

  for (const row of cleaned) {
    const fingerprint = `${row.customerId}|${row.transactionDate}|${row.amount}|${row.transactionType}`;
    const hash = hashString(fingerprint);
    if (!seen.has(hash)) {
      seen.add(hash);
      deduped.push(row);
    }
  }

  return { cleaned: deduped, duplicatesRemoved: cleaned.length - deduped.length };
}

// ===== MODULE 2: Categorization =====
const REVENUE_RULES: Record<string, string> = {
  'Subscription': 'Recurring',
  'Subscription (Annual)': 'Recurring',
  'Subscription (Upgrade Pro-Rata)': 'Bridge',
  'Discount': 'Contra-Revenue',
  'Refund': 'Contra-Revenue',
  'Consulting': 'NRR',
  'Setup Fee': 'NRR',
};

function categorize(rows: RawTransaction[]): { categorized: (RawTransaction & { revenueClass: string | null })[]; warnings: string[] } {
  const warnings: string[] = [];
  const unmappedTypes = new Set<string>();

  const categorized = rows.map(r => {
    const revenueClass = REVENUE_RULES[r.transactionType] || null;
    if (!revenueClass && !unmappedTypes.has(r.transactionType)) {
      unmappedTypes.add(r.transactionType);
    }
    return { ...r, revenueClass };
  });

  if (unmappedTypes.size > 0) {
    warnings.push(`Unmapped transaction types: ${Array.from(unmappedTypes).join(', ')}`);
  }

  return { categorized, warnings };
}

// ===== MODULE 3: Normalization (Implied MRR) =====
const AVG_DAYS_PER_MONTH = 30.42;

function normalize(rows: (RawTransaction & { revenueClass: string | null })[]): ProcessedTransaction[] {
  return rows.map(r => {
    const startMs = new Date(r.startDate).getTime();
    const endMs = new Date(r.endDate).getTime();
    const duration = Math.max(0, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));

    const isSubscription = r.transactionType.toLowerCase().includes('subscription');
    const impliedMRR = (isSubscription && duration > 0)
      ? (r.amount / duration) * AVG_DAYS_PER_MONTH
      : 0;

    const fingerprint = `${r.customerId}|${r.transactionDate}|${r.amount}|${r.transactionType}`;

    return {
      ...r,
      duration,
      impliedMRR: Math.round(impliedMRR * 100) / 100,
      transactionHash: hashString(fingerprint),
      prevEnd: null,
      gap: null,
      eventType: null,
    };
  });
}

// ===== MODULE 4: Event Reconstruction =====
function reconstructEvents(rows: ProcessedTransaction[]): ProcessedTransaction[] {
  // Filter to recurring/bridge only
  const lifecycle = rows
    .filter(r => r.revenueClass === 'Recurring' || r.revenueClass === 'Bridge')
    .sort((a, b) => {
      if (a.customerId !== b.customerId) return a.customerId.localeCompare(b.customerId);
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  // Build a map of prev_end and gap per transaction hash
  const eventMap = new Map<string, { prevEnd: string | null; gap: number | null; eventType: string }>();
  let prevCustomer = '';
  let prevEndDate: Date | null = null;

  for (const row of lifecycle) {
    if (row.customerId !== prevCustomer) {
      // New customer
      eventMap.set(row.transactionHash, { prevEnd: null, gap: null, eventType: 'New' });
      prevCustomer = row.customerId;
      prevEndDate = new Date(row.endDate);
      continue;
    }

    const startDate = new Date(row.startDate);
    const gap = prevEndDate ? Math.round((startDate.getTime() - prevEndDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

    let eventType = 'New';
    if (gap === null) {
      eventType = 'New';
    } else if (gap < 0) {
      eventType = 'Overlap/Upsell';
    } else if (gap <= 30) {
      eventType = 'Renewal';
    } else {
      eventType = 'Resurrection';
    }

    eventMap.set(row.transactionHash, {
      prevEnd: prevEndDate ? prevEndDate.toISOString().split('T')[0] : null,
      gap,
      eventType,
    });

    prevEndDate = new Date(row.endDate);
  }

  // Merge back into all rows
  return rows.map(r => {
    const event = eventMap.get(r.transactionHash);
    if (event) {
      return { ...r, ...event };
    }
    return r;
  });
}

// ===== MODULE 5: MRR Ledger =====
interface MRRLedgerEntry {
  month: string;
  customerId: string;
  mrr: number;
}

function buildMRRLedger(rows: ProcessedTransaction[]): MRRLedgerEntry[] {
  const mrrRows = rows.filter(r => r.impliedMRR > 0);
  const ledger: MRRLedgerEntry[] = [];

  for (const row of mrrRows) {
    const start = new Date(row.startDate);
    const end = new Date(row.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

    // Generate months between start and end
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endMonth) {
      ledger.push({
        month: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        customerId: row.customerId,
        mrr: row.impliedMRR,
      });
      current.setMonth(current.getMonth() + 1);
    }
  }

  return ledger;
}

// ===== AGGREGATION =====
function aggregateMonthlyMRR(ledger: MRRLedgerEntry[]): { month: string; totalMRR: number; customerCount: number }[] {
  const monthMap = new Map<string, { total: number; customers: Set<string> }>();

  for (const entry of ledger) {
    if (!monthMap.has(entry.month)) {
      monthMap.set(entry.month, { total: 0, customers: new Set() });
    }
    const m = monthMap.get(entry.month)!;
    m.total += entry.mrr;
    m.customers.add(entry.customerId);
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      totalMRR: Math.round(data.total * 100) / 100,
      customerCount: data.customers.size,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function computeEventSummary(rows: ProcessedTransaction[]) {
  const summary = { new: 0, renewal: 0, resurrection: 0, overlapUpsell: 0 };
  for (const r of rows) {
    if (r.eventType === 'New') summary.new++;
    else if (r.eventType === 'Renewal') summary.renewal++;
    else if (r.eventType === 'Resurrection') summary.resurrection++;
    else if (r.eventType === 'Overlap/Upsell') summary.overlapUpsell++;
  }
  return summary;
}

// ===== MAIN HANDLER =====
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions } = await req.json() as { transactions: RawTransaction[] };

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return new Response(JSON.stringify({ error: 'No transactions provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (transactions.length > 10000) {
      return new Response(JSON.stringify({ error: 'Too many transactions (max 10,000)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Module 1: Sanitize & Dedup
    const { cleaned, duplicatesRemoved } = sanitizeAndDedup(transactions);

    // Module 2: Categorize
    const { categorized, warnings } = categorize(cleaned);

    // Module 3: Normalize
    const normalized = normalize(categorized);

    // Module 4: Event Reconstruction
    const withEvents = reconstructEvents(normalized);

    // Module 5: MRR Ledger
    const mrrLedger = buildMRRLedger(withEvents);
    const monthlyMRR = aggregateMonthlyMRR(mrrLedger);

    // Summaries
    const eventSummary = computeEventSummary(withEvents);

    const revenueBreakdown: Record<string, number> = {};
    for (const r of withEvents) {
      const cls = r.revenueClass || 'Uncategorized';
      revenueBreakdown[cls] = (revenueBreakdown[cls] || 0) + r.amount;
    }

    const latestMonth = monthlyMRR[monthlyMRR.length - 1];
    const prevMonth = monthlyMRR.length > 1 ? monthlyMRR[monthlyMRR.length - 2] : null;
    const mrrGrowthRate = prevMonth && prevMonth.totalMRR > 0
      ? ((latestMonth.totalMRR - prevMonth.totalMRR) / prevMonth.totalMRR) * 100
      : 0;

    const result = {
      cleanTransactions: withEvents,
      mrrLedger,
      monthlyMRR,
      eventSummary,
      warnings,
      summary: {
        totalTransactions: withEvents.length,
        duplicatesRemoved,
        latestMRR: latestMonth?.totalMRR || 0,
        mrrGrowthRate: Math.round(mrrGrowthRate * 100) / 100,
        avgImpliedMRR: withEvents.length > 0
          ? Math.round(withEvents.reduce((s, r) => s + r.impliedMRR, 0) / withEvents.filter(r => r.impliedMRR > 0).length * 100) / 100
          : 0,
        revenueBreakdown,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
