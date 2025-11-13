import * as XLSX from 'xlsx';

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

export const parseExcelFile = async (file: File): Promise<FinancialData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedData: FinancialData[] = jsonData.map((row: any) => ({
          date: row['Date'] || row['Month'] || '',
          revenue: parseFloat(row['Revenue'] || row['MRR'] || 0),
          operatingExpenses: parseFloat(row['Operating Expenses'] || row['Expenses'] || 0),
          customerCount: parseInt(row['Customer Count'] || row['Customers'] || 0),
          churnRate: parseFloat(row['Churn Rate'] || row['Churn'] || 0),
          cashIn: parseFloat(row['Cash In'] || 0),
          cashOut: parseFloat(row['Cash Out'] || 0),
          cashBalance: parseFloat(row['Cash Balance'] || 0),
        }));

        // Validate data
        if (parsedData.length === 0) {
          reject(new Error('No data found in file'));
          return;
        }

        // Check for required columns
        const firstRow = parsedData[0];
        if (!firstRow.date || firstRow.revenue === undefined) {
          reject(new Error('Missing required columns: Date and Revenue are required'));
          return;
        }

        resolve(parsedData);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please check the format.'));
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
