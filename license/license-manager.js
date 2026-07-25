import { FEATURE_FLAGS } from '../config/product-config.js';

const LICENSE_STORAGE_KEY = 'budgetquest.license';

export class LicenseManager {
  constructor({ publicKey = null } = {}) {
    this.publicKey = publicKey;
    this.license = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async importLicense(file) {
    if (!(file instanceof File)) {
      throw new TypeError('Eine Lizenzdatei wird benötigt.');
    }

    const license = JSON.parse(await file.text());
    this.validateStructure(license);

    // Die kryptografische Ed25519-Prüfung wird ergänzt, sobald der
    // öffentliche Produktionsschlüssel festgelegt ist.
    if (this.publicKey && !license.signature) {
      throw new Error('Die Lizenz enthält keine Signatur.');
    }

    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(license));
    this.license = license;
    return license;
  }

  validateStructure(license) {
    const required = ['product', 'licensee', 'licenseId', 'edition', 'features'];
    for (const key of required) {
      if (!license || license[key] == null) {
        throw new Error(`Ungültige Lizenz: ${key} fehlt.`);
      }
    }
    if (license.product !== 'BudgetQuest') {
      throw new Error('Die Lizenz gehört nicht zu BudgetQuest.');
    }
  }

  hasFeature(feature) {
    if (this.license?.edition === 'full') {
      return this.license.features?.includes(feature) ?? true;
    }
    return Boolean(FEATURE_FLAGS[feature]);
  }

  getEdition() {
    return this.license?.edition || 'demo';
  }

  clear() {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    this.license = null;
  }
}
