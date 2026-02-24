import ExcelJS from 'exceljs';
import { RawTransaction } from './dd-types';

const MAX_ROWS = 10000;
const MAX_DATE_STRING_LENGTH = 50;

// Helper to get cell value by column header name
const getValueByHeader = (row: ExcelJS.Row, headerMap: Map<string, number>, ...possibleNames: string[]): any => {
  for (const name of possibleNames) {
    const colIndex = headerMap.get(name.toLowerCase());
    if (colIndex !== undefined) {
      const cell = row.getCell(colIndex);
      if (cell.type === ExcelJS.ValueType.Formula) {
        return cell.result;
      }
      return cell.value;
    }
  }
  return undefined;
};

function parseDate(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? '' : val.toISOString().split('T')[0];
  }
  if (typeof val === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + val * 86400000);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }
  const str = String(val).substring(0, MAX_DATE_STRING_LENGTH).trim();
  const date = new Date(str);
  return isNaN(date.getTime()) ? str : date.toISOString().split('T')[0];
}

function parseAmount(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return parseFloat(String(val).replace(/€/g, '').trim().replace(/,/g, '.')) || 0;
}

export async function parseTransactionExcel(file: File): Promise<RawTransaction[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error('No worksheets found in file');

  // Build header map
  const headerMap = new Map<string, number>();
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const value = String(cell.value ?? '').toLowerCase().trim();
    if (value) headerMap.set(value, colNumber);
  });

  const totalDataRows = worksheet.rowCount - 1;
  if (totalDataRows <= 0) throw new Error('No data found in file');
  if (totalDataRows > MAX_ROWS) throw new Error(`File contains too many rows (${totalDataRows}). Maximum ${MAX_ROWS} rows allowed.`);

  const transactions: RawTransaction[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    if (row.cellCount === 0) continue;

    try {
      const customerId = String(getValueByHeader(row, headerMap, 'customer id', 'customerid', 'client id') ?? '').trim();
      const transactionDate = parseDate(getValueByHeader(row, headerMap, 'transaction date', 'date'));
      const amount = parseAmount(getValueByHeader(row, headerMap, 'amount'));
      const transactionType = String(getValueByHeader(row, headerMap, 'transaction types', 'transaction type', 'type') ?? '').trim();
      const startDate = parseDate(getValueByHeader(row, headerMap, 'start date', 'start'));
      const endDate = parseDate(getValueByHeader(row, headerMap, 'end date', 'end'));

      if (!customerId || !transactionDate) continue; // Skip rows without key fields

      transactions.push({ customerId, transactionDate, amount, transactionType, startDate, endDate });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Row ${rowNumber}: ${msg}`);
    }
  }

  if (transactions.length === 0) throw new Error('No valid transaction data found. Ensure columns: Customer ID, Transaction Date, Amount, Transaction Types, Start date, End date');

  return transactions;
}

export async function generateDDTemplate() {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Transactions');

  ws.columns = [
    { header: 'Customer ID', key: 'customerId', width: 15 },
    { header: 'Transaction Date', key: 'transactionDate', width: 18 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Transaction Types', key: 'transactionTypes', width: 30 },
    { header: 'Start date', key: 'startDate', width: 15 },
    { header: 'End date', key: 'endDate', width: 15 },
  ];

  // Style header row
  ws.getRow(1).font = { bold: true };

  ws.addRows([
    { customerId: 'C001', transactionDate: '2024-01-15', amount: 1200, transactionTypes: 'Subscription', startDate: '2024-01-01', endDate: '2024-12-31' },
    { customerId: 'C001', transactionDate: '2024-02-01', amount: 500, transactionTypes: 'Consulting', startDate: '2024-02-01', endDate: '2024-02-28' },
    { customerId: 'C002', transactionDate: '2024-03-01', amount: 600, transactionTypes: 'Subscription', startDate: '2024-03-01', endDate: '2024-08-31' },
    { customerId: 'C002', transactionDate: '2024-04-01', amount: -50, transactionTypes: 'Discount', startDate: '2024-04-01', endDate: '2024-04-30' },
    { customerId: 'C001', transactionDate: '2025-01-10', amount: 1400, transactionTypes: 'Subscription (Annual)', startDate: '2025-01-01', endDate: '2025-12-31' },
    { customerId: 'C003', transactionDate: '2024-06-01', amount: 300, transactionTypes: 'Subscription', startDate: '2024-06-01', endDate: '2024-11-30' },
    { customerId: 'C003', transactionDate: '2025-01-15', amount: 350, transactionTypes: 'Subscription', startDate: '2025-01-01', endDate: '2025-06-30' },
    { customerId: 'C002', transactionDate: '2024-05-01', amount: 200, transactionTypes: 'Setup Fee', startDate: '2024-05-01', endDate: '2024-05-31' },
    { customerId: 'C004', transactionDate: '2024-07-01', amount: 900, transactionTypes: 'Subscription', startDate: '2024-07-01', endDate: '2025-06-30' },
    { customerId: 'C004', transactionDate: '2024-09-01', amount: -100, transactionTypes: 'Refund', startDate: '2024-09-01', endDate: '2024-09-30' },
    { customerId: 'C004', transactionDate: '2024-10-01', amount: 150, transactionTypes: 'Subscription (Upgrade Pro-Rata)', startDate: '2024-10-01', endDate: '2025-06-30' },
  ]);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'FinArrow_DD_Template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
