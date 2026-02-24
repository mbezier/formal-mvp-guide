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
