const DEFAULT_ALLOWED_ORIGINS = Object.freeze([
  window.location.origin,
  'https://cdn.jsdelivr.net'
]);

const SENSITIVE_KEYS = Object.freeze([
  'transactions',
  'income',
  'expenses',
  'balance',
  'account',
  'iban',
  'merchant',
  'receipt',
  'budget',
  'equity',
  'salary',
  'household'
]);

function resolveUrl(input) {
  if (input instanceof Request) return new URL(input.url, window.location.href);
  return new URL(String(input), window.location.href);
}

function isAllowed(url, allowedOrigins) {
  return allowedOrigins.includes(url.origin);
}

function containsSensitivePayload(body) {
  if (!body) return false;
  if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) return true;

  const text = typeof body === 'string' ? body : JSON.stringify(body);
  const normalized = text.toLowerCase();
  return SENSITIVE_KEYS.some(key => normalized.includes(key));
}

export function installNetworkGuard(options = {}) {
  const allowedOrigins = Object.freeze([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...(options.allowedOrigins || [])
  ]);

  const originalFetch = window.fetch.bind(window);
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  window.fetch = async (input, init = {}) => {
    const url = resolveUrl(input);
    const method = String(init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

    if (!isAllowed(url, allowedOrigins)) {
      throw new Error(`BudgetQuest blockiert Netzwerkzugriff auf ${url.origin}.`);
    }

    if (method !== 'GET' && containsSensitivePayload(init.body)) {
      throw new Error('BudgetQuest blockiert die Übertragung möglicher Finanzdaten.');
    }

    return originalFetch(input, init);
  };

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    const resolved = resolveUrl(url);
    this.__budgetQuestRequest = {
      method: String(method || 'GET').toUpperCase(),
      url: resolved
    };
    return originalOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function(body) {
    const request = this.__budgetQuestRequest;
    if (request && !isAllowed(request.url, allowedOrigins)) {
      throw new Error(`BudgetQuest blockiert Netzwerkzugriff auf ${request.url.origin}.`);
    }
    if (request && request.method !== 'GET' && containsSensitivePayload(body)) {
      throw new Error('BudgetQuest blockiert die Übertragung möglicher Finanzdaten.');
    }
    return originalSend.call(this, body);
  };

  return Object.freeze({
    enabled: true,
    allowedOrigins
  });
}
