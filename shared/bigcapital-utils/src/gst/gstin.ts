import {
  GST_ERRORS,
  GST_STATES_BY_CODE,
  LEGACY_GSTIN_STATE_CODES,
} from "./constants";

const GSTIN_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Regular taxpayer GSTIN: 2-digit state code, 10-character PAN, entity number
 * (1-9, A-Z), the letter Z, and a check character.
 */
const REGULAR_GSTIN_PATTERN =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/**
 * Any 15-character GSTIN-like identifier (also covers TDS/TCS deductors, UIN
 * holders and non-resident registrations, whose 14th character is not Z).
 */
const ANY_GSTIN_PATTERN = /^[0-9]{2}[0-9A-Z]{12}[0-9A-Z]$/;

export type GstinError = (typeof GST_ERRORS)[keyof Pick<
  typeof GST_ERRORS,
  | "GSTIN_INVALID_LENGTH"
  | "GSTIN_INVALID_FORMAT"
  | "GSTIN_INVALID_STATE_CODE"
  | "GSTIN_INVALID_CHECKSUM"
>];

export interface GstinValidationResult {
  valid: boolean;
  gstin: string;
  error?: GstinError;
  stateCode?: string;
  pan?: string;
  isRegularTaxpayer?: boolean;
}

/** Upper-cases and strips spaces and dashes. */
export const normalizeGstin = (value: string): string =>
  (value ?? "").toUpperCase().replace(/[\s-]/g, "");

/**
 * Computes the GSTIN check character (Luhn mod 36) for the first 14 characters.
 */
export const computeGstinCheckChar = (first14: string): string => {
  let sum = 0;

  for (let i = 0; i < 14; i++) {
    const value = GSTIN_CHARSET.indexOf(first14[i]);
    if (value < 0) {
      throw new Error(`Invalid GSTIN character: ${first14[i]}`);
    }
    const factor = i % 2 === 0 ? 1 : 2;
    const product = value * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GSTIN_CHARSET[(36 - (sum % 36)) % 36];
};

const isKnownGstinStateCode = (code: string): boolean =>
  GST_STATES_BY_CODE.has(code) ||
  (LEGACY_GSTIN_STATE_CODES as readonly string[]).includes(code);

/**
 * Validates a GSTIN: length, character format, state code and check character.
 */
export const validateGstin = (value: string): GstinValidationResult => {
  const gstin = normalizeGstin(value);

  if (gstin.length !== 15) {
    return { valid: false, gstin, error: GST_ERRORS.GSTIN_INVALID_LENGTH };
  }
  if (!ANY_GSTIN_PATTERN.test(gstin)) {
    return { valid: false, gstin, error: GST_ERRORS.GSTIN_INVALID_FORMAT };
  }
  const stateCode = gstin.slice(0, 2);

  if (!isKnownGstinStateCode(stateCode)) {
    return { valid: false, gstin, error: GST_ERRORS.GSTIN_INVALID_STATE_CODE };
  }
  if (computeGstinCheckChar(gstin.slice(0, 14)) !== gstin[14]) {
    return { valid: false, gstin, error: GST_ERRORS.GSTIN_INVALID_CHECKSUM };
  }
  const isRegularTaxpayer = REGULAR_GSTIN_PATTERN.test(gstin);

  return {
    valid: true,
    gstin,
    stateCode,
    isRegularTaxpayer,
    pan: isRegularTaxpayer ? gstin.slice(2, 12) : undefined,
  };
};

/** Returns the 2-digit state code of a valid GSTIN, or null. */
export const getGstinStateCode = (value: string): string | null => {
  const result = validateGstin(value);
  return result.valid ? (result.stateCode as string) : null;
};
