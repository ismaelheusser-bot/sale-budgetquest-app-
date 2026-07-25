import { PRODUCT_CONFIG } from '../config/product-config.js';

export function assertTransactionLimit(currentCount) {
  const limit = PRODUCT_CONFIG.demo.maxTransactions;
  if (PRODUCT_CONFIG.edition === 'demo' && currentCount >= limit) {
    throw new Error(`Die Testversion ist auf ${limit} Buchungen begrenzt.`);
  }
}

export function canExport() {
  return PRODUCT_CONFIG.edition !== 'demo' || PRODUCT_CONFIG.demo.allowExport;
}

export function canImport(type) {
  if (PRODUCT_CONFIG.edition !== 'demo') return true;
  if (type === 'pdf') return PRODUCT_CONFIG.demo.allowPdfImport;
  if (type === 'csv') return PRODUCT_CONFIG.demo.allowCsvImport;
  if (type === 'receipt') return PRODUCT_CONFIG.demo.allowReceiptScan;
  return false;
}

export function getHomeModuleMode() {
  return PRODUCT_CONFIG.edition === 'demo'
    ? PRODUCT_CONFIG.demo.homeModuleMode
    : 'full';
}
