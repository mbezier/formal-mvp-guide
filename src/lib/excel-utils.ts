import ExcelJS from 'exceljs';

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
  
  // Handle Date objects (ExcelJS returns Date objects for date cells)
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) {
      throw new Error('Invalid date format');
    }
    return dateStr.toISOString().split('T')[0];
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

// Helper to get cell value by column header name
const getValueByHeader = (row: ExcelJS.Row, headerMap: Map<string, number>, ...possibleNames: string[]): any => {
  for (const name of possibleNames) {
    const colIndex = headerMap.get(name.toLowerCase());
    if (colIndex !== undefined) {
      const cell = row.getCell(colIndex);
      // ExcelJS: use .value, ignore formulas (use .result if formula)
      if (cell.type === ExcelJS.ValueType.Formula) {
        return cell.result;
      }
      return cell.value;
    }
  }
  return undefined;
};

export const parseExcelFile = async (file: File): Promise<FinancialData[]> => {
  const arrayBuffer = await file.arrayBuffer();
  
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('No worksheets found in file');
  }
  
  // Build header map from first row
  const headerMap = new Map<string, number>();
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const value = String(cell.value ?? '').toLowerCase().trim();
    if (value) {
      headerMap.set(value, colNumber);
    }
  });
  
  const totalDataRows = worksheet.rowCount - 1; // exclude header
  if (totalDataRows <= 0) {
    throw new Error('No data found in file');
  }
  
  if (totalDataRows > MAX_ROWS) {
    throw new Error(`File contains too many rows (${totalDataRows}). Maximum ${MAX_ROWS} rows allowed.`);
  }
  
  const parsedData: FinancialData[] = [];
  
  // Iterate data rows (starting from row 2)
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    
    // Skip completely empty rows
    if (row.cellCount === 0) continue;
    
    try {
      const parsedRow: FinancialData = {
        date: validateDate(getValueByHeader(row, headerMap, 'Date', 'Month')),
        revenue: validatePositiveNumber(getValueByHeader(row, headerMap, 'Revenue', 'MRR') ?? 0, 'Revenue'),
        operatingExpenses: validatePositiveNumber(getValueByHeader(row, headerMap, 'Operating Expenses', 'Expenses') ?? 0, 'Operating Expenses'),
        customerCount: Math.floor(validatePositiveNumber(getValueByHeader(row, headerMap, 'Customer Count', 'Customers') ?? 0, 'Customer Count')),
        churnRate: validatePercentage(getValueByHeader(row, headerMap, 'Churn Rate', 'Churn') ?? 0, 'Churn Rate'),
        cashIn: validatePositiveNumber(getValueByHeader(row, headerMap, 'Cash In') ?? 0, 'Cash In'),
        cashOut: validatePositiveNumber(getValueByHeader(row, headerMap, 'Cash Out') ?? 0, 'Cash Out'),
        cashBalance: validateNumber(getValueByHeader(row, headerMap, 'Cash Balance') ?? 0, 'Cash Balance'),
      };
      
      parsedData.push(parsedRow);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Row ${rowNumber}: ${errorMessage}`);
    }
  }
  
  if (parsedData.length === 0) {
    throw new Error('No valid data found in file');
  }
  
  // Check for required columns
  if (!parsedData[0].date) {
    throw new Error('Missing required column: Date or Month');
  }
  
  return parsedData;
};

export const calculateKPIs = (data: FinancialData[]): KPIMetrics => {
  if (data.length === 0) {
    throw new Error('No data available for calculations');
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const current = sortedData[sortedData.length - 1];
  const previous = sortedData.length > 1 ? sortedData[sortedData.length - 2] : current;

  const mrr = current.revenue;
  const mrrChange = previous.revenue ? ((mrr - previous.revenue) / previous.revenue) * 100 : 0;

  const cac = current.customerCount > 0 ? current.operatingExpenses / current.customerCount : 0;
  const previousCac = previous.customerCount > 0 ? previous.operatingExpenses / previous.customerCount : 0;
  const cacChange = previousCac ? ((cac - previousCac) / previousCac) * 100 : 0;

  const churnRate = current.churnRate;
  const churnChange = previous.churnRate ? ((churnRate - previous.churnRate) / previous.churnRate) * 100 : 0;

  const burnRate = current.cashOut - current.cashIn;
  const previousBurnRate = previous.cashOut - previous.cashIn;
  const burnRateChange = previousBurnRate ? ((burnRate - previousBurnRate) / previousBurnRate) * 100 : 0;

  const avgBurnRate = sortedData.reduce((sum, d) => sum + (d.cashOut - d.cashIn), 0) / sortedData.length;
  const runwayMonths = avgBurnRate > 0 ? current.cashBalance / avgBurnRate : 999;
  const runway = runwayMonths * 30;

  const ltv = current.customerCount > 0 ? (mrr * 12 * 3) / current.customerCount : 0;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  const previousLtv = previous.customerCount > 0 ? (previous.revenue * 12 * 3) / previous.customerCount : 0;
  const previousLtvCacRatio = previousCac > 0 ? previousLtv / previousCac : 0;
  const ltvCacChange = previousLtvCacRatio ? ((ltvCacRatio - previousLtvCacRatio) / previousLtvCacRatio) * 100 : 0;

  const arpu = current.customerCount > 0 ? mrr / current.customerCount : 0;
  const previousArpu = previous.customerCount > 0 ? previous.revenue / previous.customerCount : 0;
  const arpuChange = previousArpu ? ((arpu - previousArpu) / previousArpu) * 100 : 0;

  return {
    mrr, mrrChange, cac, cacChange, churnRate, churnChange,
    burnRate, burnRateChange, runway, runwayMonths,
    ltvCacRatio, ltvCacChange, arpu, arpuChange,
  };
};

export const generateExcelTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Financial Data');
  
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Revenue', key: 'revenue', width: 15 },
    { header: 'Operating Expenses', key: 'operatingExpenses', width: 20 },
    { header: 'Customer Count', key: 'customerCount', width: 18 },
    { header: 'Churn Rate', key: 'churnRate', width: 12 },
    { header: 'Cash In', key: 'cashIn', width: 15 },
    { header: 'Cash Out', key: 'cashOut', width: 15 },
    { header: 'Cash Balance', key: 'cashBalance', width: 15 },
  ];
  
  worksheet.addRows([
    { date: '2024-01-01', revenue: 50000, operatingExpenses: 30000, customerCount: 100, churnRate: 5, cashIn: 55000, cashOut: 35000, cashBalance: 200000 },
    { date: '2024-02-01', revenue: 55000, operatingExpenses: 32000, customerCount: 110, churnRate: 4.5, cashIn: 60000, cashOut: 37000, cashBalance: 223000 },
    { date: '2024-03-01', revenue: 60000, operatingExpenses: 35000, customerCount: 120, churnRate: 4, cashIn: 65000, cashOut: 40000, cashBalance: 248000 },
  ]);
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'FinArrow_Template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
};
