// Raw transaction row from the uploaded Excel file
export interface RawTransaction {
  customerId: string;
  transactionDate: string;
  amount: number;
  transactionType: string;
  startDate: string;
  endDate: string;
}

// Cleaned & enriched transaction after DD processing
export interface ProcessedTransaction extends RawTransaction {
  revenueClass: string | null;
  duration: number;
  impliedMRR: number;
  transactionHash: string;
  prevEnd: string | null;
  gap: number | null;
  eventType: string | null;
}

// MRR Ledger: monthly MRR per customer
export interface MRRLedgerEntry {
  month: string;
  customerId: string;
  mrr: number;
}

// Aggregated monthly MRR for charts
export interface MonthlyMRR {
  month: string;
  totalMRR: number;
  customerCount: number;
}

// Event summary
export interface EventSummary {
  new: number;
  renewal: number;
  resurrection: number;
  overlapUpsell: number;
}

// Full DD result returned by the edge function
export interface DDResult {
  cleanTransactions: ProcessedTransaction[];
  mrrLedger: MRRLedgerEntry[];
  monthlyMRR: MonthlyMRR[];
  eventSummary: EventSummary;
  warnings: string[];
  summary: {
    totalTransactions: number;
    duplicatesRemoved: number;
    latestMRR: number;
    mrrGrowthRate: number;
    avgImpliedMRR: number;
    revenueBreakdown: Record<string, number>;
  };
}
