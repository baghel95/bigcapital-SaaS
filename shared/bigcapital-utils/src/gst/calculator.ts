import {
  GST_ERRORS,
  GST_RATES,
  GST_STATES_BY_CODE,
  GstSupplyType,
  PLACE_OF_SUPPLY_OUTSIDE_INDIA,
} from "./constants";

export interface GstLineInput {
  /** Line amount after discount, before or including tax (see `isTaxInclusive`). */
  amount: number;
  /** GST rate in percent, e.g. 18. */
  rate: number;
  /** Compensation cess rate in percent, if any. */
  cessRate?: number;
  /** True when `amount` already includes GST (and cess). */
  isTaxInclusive?: boolean;
}

export interface GstContext {
  /** State code of the supplier's registration (first two digits of its GSTIN). */
  supplierStateCode: string;
  /** Place of supply state code, or '96' for supplies outside India. */
  placeOfSupplyStateCode: string;
  /** SEZ supplies are always inter-state (IGST), even within the same state. */
  isSezSupply?: boolean;
  /** Reverse charge: tax is computed but paid by the recipient, not charged on the invoice. */
  isReverseCharge?: boolean;
}

export interface GstLineResult {
  supplyType: GstSupplyType;
  taxableValue: number;
  rate: number;
  cgst: number;
  /** SGST, or UTGST when the place of supply is a UT without legislature. */
  sgst: number;
  isUtgst: boolean;
  igst: number;
  cess: number;
  totalTax: number;
  /** Tax the supplier collects on this invoice (0 under reverse charge). */
  taxChargedOnInvoice: number;
  /** Amount the customer pays for this line. */
  lineTotal: number;
}

export class GstCalculationError extends Error {
  constructor(
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "GstCalculationError";
  }
}

/** Rounds to 2 decimals (paise), half away from zero. */
export const roundToPaise = (value: number): number =>
  (Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * 100)) /
  100;

/**
 * Decides whether a supply is intra-state (CGST + SGST/UTGST) or inter-state (IGST).
 */
export const getSupplyType = (context: GstContext): GstSupplyType => {
  const { supplierStateCode, placeOfSupplyStateCode, isSezSupply } = context;

  if (!GST_STATES_BY_CODE.has(supplierStateCode)) {
    throw new GstCalculationError(GST_ERRORS.INVALID_SUPPLIER_STATE);
  }
  if (
    placeOfSupplyStateCode !== PLACE_OF_SUPPLY_OUTSIDE_INDIA &&
    !GST_STATES_BY_CODE.has(placeOfSupplyStateCode)
  ) {
    throw new GstCalculationError(GST_ERRORS.INVALID_PLACE_OF_SUPPLY);
  }
  if (isSezSupply || placeOfSupplyStateCode === PLACE_OF_SUPPLY_OUTSIDE_INDIA) {
    return GstSupplyType.InterState;
  }
  return supplierStateCode === placeOfSupplyStateCode
    ? GstSupplyType.IntraState
    : GstSupplyType.InterState;
};

export const isValidGstRate = (rate: number): boolean =>
  (GST_RATES as readonly number[]).includes(rate);

/**
 * Computes GST for one invoice line.
 *
 * Intra-state tax is split into two equal halves, each rounded to paise, so
 * CGST always equals SGST (the e-invoice schema rejects unequal halves).
 */
export const calculateGstLine = (
  line: GstLineInput,
  context: GstContext,
): GstLineResult => {
  const { amount, rate, cessRate = 0, isTaxInclusive = false } = line;

  if (!isValidGstRate(rate)) {
    throw new GstCalculationError(
      GST_ERRORS.INVALID_GST_RATE,
      `Invalid GST rate: ${rate}`,
    );
  }
  if (amount < 0) {
    throw new GstCalculationError(GST_ERRORS.NEGATIVE_TAXABLE_VALUE);
  }
  const supplyType = getSupplyType(context);
  const placeOfSupply = GST_STATES_BY_CODE.get(context.placeOfSupplyStateCode);

  const taxableValue = roundToPaise(
    isTaxInclusive ? (amount * 100) / (100 + rate + cessRate) : amount,
  );
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (supplyType === GstSupplyType.IntraState) {
    cgst = roundToPaise((taxableValue * rate) / 200);
    sgst = cgst;
  } else {
    igst = roundToPaise((taxableValue * rate) / 100);
  }
  const cess = roundToPaise((taxableValue * cessRate) / 100);
  const totalTax = roundToPaise(cgst + sgst + igst + cess);
  const taxChargedOnInvoice = context.isReverseCharge ? 0 : totalTax;

  return {
    supplyType,
    taxableValue,
    rate,
    cgst,
    sgst,
    isUtgst:
      supplyType === GstSupplyType.IntraState &&
      !!placeOfSupply?.isUnionTerritoryWithoutLegislature,
    igst,
    cess,
    totalTax,
    taxChargedOnInvoice,
    lineTotal: roundToPaise(taxableValue + taxChargedOnInvoice),
  };
};

export interface GstDocumentTotals {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
  taxChargedOnInvoice: number;
  total: number;
  /** Rounded invoice total (to the rupee) and the round-off amount, as on Indian invoices. */
  roundedTotal: number;
  roundOff: number;
}

/** Sums line results into invoice totals, with rupee round-off. */
export const sumGstLines = (lines: GstLineResult[]): GstDocumentTotals => {
  const sum = (pick: (line: GstLineResult) => number) =>
    roundToPaise(lines.reduce((acc, line) => acc + pick(line), 0));

  const total = sum((l) => l.lineTotal);
  const roundedTotal = Math.round(total);

  return {
    taxableValue: sum((l) => l.taxableValue),
    cgst: sum((l) => l.cgst),
    sgst: sum((l) => l.sgst),
    igst: sum((l) => l.igst),
    cess: sum((l) => l.cess),
    totalTax: sum((l) => l.totalTax),
    taxChargedOnInvoice: sum((l) => l.taxChargedOnInvoice),
    total,
    roundedTotal,
    roundOff: roundToPaise(roundedTotal - total),
  };
};
