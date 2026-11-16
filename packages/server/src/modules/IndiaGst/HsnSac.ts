export type HsnSacKind = 'hsn' | 'sac';

export interface HsnSacValidationResult {
  valid: boolean;
  code: string;
  kind?: HsnSacKind;
}

/**
 * Validates an HSN (goods) or SAC (services) code.
 * - SAC: 6 digits starting with 99.
 * - HSN: 4, 6 or 8 digits (2-digit chapters are not accepted on invoices).
 * Which length is mandatory depends on the supplier's turnover; that rule is
 * applied by the invoice validator, not here.
 */
export const validateHsnSac = (value: string): HsnSacValidationResult => {
  const code = (value ?? '').replace(/[\s.]/g, '');

  if (/^99[0-9]{4}$/.test(code)) {
    return { valid: true, code, kind: 'sac' };
  }
  if (/^[0-9]{4}([0-9]{2}){0,2}$/.test(code) && !code.startsWith('99')) {
    return { valid: true, code, kind: 'hsn' };
  }
  return { valid: false, code };
};
