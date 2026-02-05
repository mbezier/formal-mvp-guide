import * as XLSX from 'xlsx';

// Validation constants
const MAX_ROWS = 1000;
const MAX_NUMBER_VALUE = 1e12;
const MIN_NUMBER_VALUE = -1e12;
const MAX_DATE_STRING_LENGTH = 50;

export interface FinancialData {
  date: string;
  revenue: number;
  operatingExpenses: number;
  customerCount: number;
  churnRate: number;
  cashIn: number;
  cashOut: number;
  cashBalance: number;
}

export interface KPIMetrics {
  mrr: number;
  mrrChange: number;
  cac: number;
  cacChange: number;
  churnRate: number;
  churnChange: number;
  burnRate: number;
  burnRateChange: number;
  runway: number;
  runwayMonths: number;
  ltvCacRatio: number;
  ltvCacChange: number;
  arpu: number;
  arpuChange: number;
}

// Validation helper functions
const validateNumber = (val: any, fieldName: string, min = MIN_NUMBER_VALUE, max = MAX_NUMBER_VALUE, allowZero = true): number => {
  if (val === undefined || val === null || val === '') {
    if (allowZero) return 0;
    throw new Error(`${fieldName} is required`);
  }
  
  const num = parseFloat(String(val));
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`Invalid ${fieldName}: must be a valid number`);
  }
  
  if (num < min || num > max) {
    throw new Error(`Invalid ${fieldName}: value must be between ${min.toLocaleString()} and ${max.toLocaleString()}`);
  }
  
  return num;
};

const validatePositiveNumber = (val: any, fieldName: string, max = MAX_NUMBER_VALUE): number => {
  return validateNumber(val, fieldName, 0, max, true);
};

const validatePercentage = (val: any, fieldName: string): number => {
  return validateNumber(val, fieldName, 0, 100, true);
};

const validateDate = (dateStr: any): string => {
  if (dateStr === undefined || dateStr === null || dateStr === '') {
    throw new Error('Date is required');
  }
  
  // Limit string length to prevent memory issues
  const str = String(dateStr).substring(0, MAX_DATE_STRING_LENGTH).trim();
  
  // Handle Excel serial date numbers
  if (typeof dateStr === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString().split('T')[0];
  }
  
  // Parse string date
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  
  return str;
};

export const parseExcelFile = async (file: File): Promise<FinancialData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        
        // Use secure XLSX options to prevent formula evaluation and HTML parsing
        const workbook = XLSX.read(data, { 
          type: 'binary',
          cellFormula: false,  // Don't parse formulas
          cellHTML: false,     // Don't parse HTML
          cellText: false      // Don't parse rich text
        });
        
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('No worksheets found in file'));
          return;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        // Validate row count to prevent memory exhaustion
        if (jsonData.length === 0) {
          reject(new Error('No data found in file'));
          return;
        }
        
        if (jsonData.length > MAX_ROWS) {
          reject(new Error(`File contains too many rows (${jsonData.length}). Maximum ${MAX_ROWS} rows allowed.`));
          return;
        }

        // Parse and validate each row with comprehensive error handling
        const parsedData: FinancialData[] = [];
        
        for (let index = 0; index < jsonData.length; index++) {
          const row: any = jsonData[index];
          const rowNumber = index + 2; // +2 because Excel rows are 1-indexed and row 1 is header
          
          try {
            const parsedRow: FinancialData = {
              date: validateDate(row['Date'] || row['Month']),
              revenue: validatePositiveNumber(row['Revenue'] || row['MRR'] || 0, 'Revenue'),
              operatingExpenses: validatePositiveNumber(row['Operating Expenses'] || row['Expenses'] || 0, 'Operating Expenses'),
              customerCount: Math.floor(validatePositiveNumber(row['Customer Count'] || row['Customers'] || 0, 'Customer Count')),
              churnRate: validatePercentage(row['Churn Rate'] || row['Churn'] || 0, 'Churn Rate'),
              cashIn: validatePositiveNumber(row['Cash In'] || 0, 'Cash In'),
              cashOut: validatePositiveNumber(row['Cash Out'] || 0, 'Cash Out'),
              cashBalance: validateNumber(row['Cash Balance'] || 0, 'Cash Balance'), // Can be negative
            };
            
            parsedData.push(parsedRow);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            reject(new Error(`Row ${rowNumber}: ${errorMessage}`));
            return;
          }
        }

        // Check for required columns (date and revenue must have valid data)
        const firstRow = parsedData[0];
        if (!firstRow.date) {
          reject(new Error('Missing required column: Date or Month'));
          return;
        }

        resolve(parsedData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        reject(new Error(`Failed to parse Excel file: ${errorMessage}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};

export const calculateKPIs = (data: FinancialData[]): KPIMetrics => {
  if (data.length === 0) {
    throw new Error('No data available for calculations');
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const current = sortedData[sortedData.length - 1];
  const previous = sortedData.length > 1 ? sortedData[sortedData.length - 2] : current;

  // Calculate MRR
  const mrr = current.revenue;
  const mrrChange = previous.revenue ? ((mrr - previous.revenue) / previous.revenue) * 100 : 0;

  // Calculate CAC (simplified: operating expenses / customer count)
  const cac = current.customerCount > 0 ? current.operatingExpenses / current.customerCount : 0;
  const previousCac = previous.customerCount > 0 ? previous.operatingExpenses / previous.customerCount : 0;
  const cacChange = previousCac ? ((cac - previousCac) / previousCac) * 100 : 0;

  // Churn Rate
  const churnRate = current.churnRate;
  const churnChange = previous.churnRate ? ((churnRate - previous.churnRate) / previous.churnRate) * 100 : 0;

  // Burn Rate (Net)
  const burnRate = current.cashOut - current.cashIn;
  const previousBurnRate = previous.cashOut - previous.cashIn;
  const burnRateChange = previousBurnRate ? ((burnRate - previousBurnRate) / previousBurnRate) * 100 : 0;

  // Runway (months)
  const avgBurnRate = sortedData.reduce((sum, d) => sum + (d.cashOut - d.cashIn), 0) / sortedData.length;
  const runwayMonths = avgBurnRate > 0 ? current.cashBalance / avgBurnRate : 999;
  const runway = runwayMonths * 30; // Convert to days

  // LTV/CAC Ratio (simplified)
  const ltv = current.customerCount > 0 ? (mrr * 12 * 3) / current.customerCount : 0; // Assuming 3-year customer lifetime
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  const previousLtv = previous.customerCount > 0 ? (previous.revenue * 12 * 3) / previous.customerCount : 0;
  const previousLtvCacRatio = previousCac > 0 ? previousLtv / previousCac : 0;
  const ltvCacChange = previousLtvCacRatio ? ((ltvCacRatio - previousLtvCacRatio) / previousLtvCacRatio) * 100 : 0;

  // ARPU
  const arpu = current.customerCount > 0 ? mrr / current.customerCount : 0;
  const previousArpu = previous.customerCount > 0 ? previous.revenue / previous.customerCount : 0;
  const arpuChange = previousArpu ? ((arpu - previousArpu) / previousArpu) * 100 : 0;

  return {
    mrr,
    mrrChange,
    cac,
    cacChange,
    churnRate,
    churnChange,
    burnRate,
    burnRateChange,
    runway,
    runwayMonths,
    ltvCacRatio,
    ltvCacChange,
    arpu,
    arpuChange,
  };
};

export const generateExcelTemplate = () => {
  const templateData = [
    {
      'Date': '2024-01-01',
      'Revenue': 50000,
      'Operating Expenses': 30000,
      'Customer Count': 100,
      'Churn Rate': 5,
      'Cash In': 55000,
      'Cash Out': 35000,
      'Cash Balance': 200000,
    },
    {
      'Date': '2024-02-01',
      'Revenue': 55000,
      'Operating Expenses': 32000,
      'Customer Count': 110,
      'Churn Rate': 4.5,
      'Cash In': 60000,
      'Cash Out': 37000,
      'Cash Balance': 223000,
    },
    {
      'Date': '2024-03-01',
      'Revenue': 60000,
      'Operating Expenses': 35000,
      'Customer Count': 120,
      'Churn Rate': 4,
      'Cash In': 65000,
      'Cash Out': 40000,
      'Cash Balance': 248000,
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Financial Data');
  
  XLSX.writeFile(wb, 'FinArrow_Template.xlsx');
};
