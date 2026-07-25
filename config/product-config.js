export const PRODUCT_CONFIG = Object.freeze({
  product: 'BudgetQuest',
  edition: 'demo',
  householdName: 'Musterhaushalt',
  currency: 'CHF',
  demo: Object.freeze({
    maxTransactions: 30,
    allowExport: false,
    allowPdfImport: false,
    allowCsvImport: true,
    allowReceiptScan: true,
    homeModuleMode: 'preview'
  })
});

export const FEATURE_FLAGS = Object.freeze({
  transactionsUnlimited: false,
  exportHousehold: false,
  importPdf: false,
  importCsv: true,
  receiptScan: true,
  homeFull: false,
  advancedStatistics: false,
  planningTools: false
});
