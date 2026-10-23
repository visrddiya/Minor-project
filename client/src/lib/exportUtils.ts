import { QueueToken, QueueMetrics } from '../types';

export const exportTokensToCSV = (tokens: QueueToken[], filename = 'queuesphere_token_log.csv') => {
  if (!tokens || tokens.length === 0) return;

  const headers = [
    'Token Number',
    'Department',
    'Branch',
    'Customer Name',
    'Customer Phone',
    'Priority Tier',
    'Counter',
    'Staff Member',
    'Status',
    'Created At',
    'Called At',
    'Completed At',
  ];

  const rows = tokens.map((t) => [
    t.tokenNumber,
    `"${t.departmentName || ''}"`,
    `"${t.branchName || ''}"`,
    `"${t.customerName || 'Walk-in'}"`,
    t.customerPhone || '',
    t.priority,
    t.counterNumber ? `Counter ${t.counterNumber}` : 'Unassigned',
    `"${t.servedByName || 'N/A'}"`,
    t.status,
    t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
    t.calledAt ? new Date(t.calledAt).toLocaleString() : '',
    t.completedAt ? new Date(t.completedAt).toLocaleString() : '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportMetricsJSON = (metrics: QueueMetrics, filename = 'queuesphere_analytics_summary.json') => {
  const jsonString = JSON.stringify(metrics, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
