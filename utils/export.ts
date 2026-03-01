import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../store/useFinanceStore';
import { getCategoryById } from '../constants/categories';
import { formatIDR } from './currency';

export async function exportTransactionsCSV(transactions: Transaction[]): Promise<void> {
  const header = 'Date,Type,Category,Amount,Note\n';
  const rows = transactions.map((t) => {
    const cat = getCategoryById(t.category);
    const date = new Date(t.date).toLocaleDateString('en-US');
    const note = (t.note || '').replace(/"/g, '""');
    return `${date},${t.type},${cat?.label || t.category},${t.amount},"${note}"`;
  }).join('\n');

  const csv = header + rows;
  const { uri } = await Print.printToFileAsync({
    html: `<pre>${csv}</pre>`,
    base64: false,
  });

  await Sharing.shareAsync(uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Transactions',
    UTI: 'public.comma-separated-values-text',
  });
}

export async function exportTransactionsPDF(transactions: Transaction[], month: string): Promise<void> {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const rows = transactions.map((t) => {
    const cat = getCategoryById(t.category);
    return `
      <tr>
        <td>${new Date(t.date).toLocaleDateString('en-US')}</td>
        <td>${cat?.icon || ''} ${cat?.label || t.category}</td>
        <td style="color: ${t.type === 'income' ? '#3FB950' : '#F85149'}">${t.type === 'income' ? '+' : '-'}${formatIDR(t.amount)}</td>
        <td>${t.note || ''}</td>
      </tr>`;
  }).join('');

  const html = `
    <html>
      <head><style>
        body { font-family: -apple-system, sans-serif; padding: 20px; background: #0D1117; color: #E6EDF3; }
        h1 { color: #F9A825; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #30363D; }
        th { color: #8B949E; font-size: 12px; text-transform: uppercase; }
        .summary { display: flex; gap: 20px; margin: 16px 0; }
        .summary-item { flex: 1; }
      </style></head>
      <body>
        <h1>Amanah — ${month}</h1>
        <div class="summary">
          <div class="summary-item">
            <p style="color:#8B949E">Income</p>
            <p style="color:#3FB950;font-size:20px;font-weight:bold">${formatIDR(totalIncome)}</p>
          </div>
          <div class="summary-item">
            <p style="color:#8B949E">Expenses</p>
            <p style="color:#F85149;font-size:20px;font-weight:bold">${formatIDR(totalExpense)}</p>
          </div>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export PDF' });
}
