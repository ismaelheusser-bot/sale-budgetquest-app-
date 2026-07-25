const REDACTED = '[geschützt]';
const SENSITIVE_FIELDS = new Set([
  'amount', 'balance', 'income', 'expense', 'expenses', 'transactions',
  'iban', 'account', 'salary', 'equity', 'merchant', 'receipt',
  'household', 'profiles', 'budget', 'goals'
]);

function sanitize(value, seen = new WeakSet()) {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (seen.has(value)) return '[zirkuläre Referenz]';
  seen.add(value);

  if (Array.isArray(value)) return value.map(item => sanitize(item, seen));

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      SENSITIVE_FIELDS.has(key.toLowerCase()) ? REDACTED : sanitize(entry, seen)
    ])
  );
}

export const SafeLogger = Object.freeze({
  info(message, metadata) {
    console.info(`[BudgetQuest] ${message}`, metadata ? sanitize(metadata) : '');
  },
  warn(message, metadata) {
    console.warn(`[BudgetQuest] ${message}`, metadata ? sanitize(metadata) : '');
  },
  error(message, error) {
    console.error(`[BudgetQuest] ${message}`, {
      name: error?.name || 'Error',
      message: error?.message || 'Unbekannter Fehler'
    });
  }
});
