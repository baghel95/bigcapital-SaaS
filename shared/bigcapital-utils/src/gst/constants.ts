/**
 * India GST reference data.
 *
 * State codes follow the GSTN state code list used in GSTINs, e-invoices and
 * e-way bills. Verify against the current GSTN master before each release.
 */

export interface GstState {
  code: string;
  name: string;
  /**
   * Union territory without its own legislature: intra-territory supplies
   * charge UTGST instead of SGST.
   */
  isUnionTerritoryWithoutLegislature: boolean;
}

export const GST_STATES: readonly GstState[] = [
  {
    code: "01",
    name: "Jammu and Kashmir",
    isUnionTerritoryWithoutLegislature: false,
  },
  {
    code: "02",
    name: "Himachal Pradesh",
    isUnionTerritoryWithoutLegislature: false,
  },
  { code: "03", name: "Punjab", isUnionTerritoryWithoutLegislature: false },
  { code: "04", name: "Chandigarh", isUnionTerritoryWithoutLegislature: true },
  {
    code: "05",
    name: "Uttarakhand",
    isUnionTerritoryWithoutLegislature: false,
  },
  { code: "06", name: "Haryana", isUnionTerritoryWithoutLegislature: false },
  { code: "07", name: "Delhi", isUnionTerritoryWithoutLegislature: false },
  { code: "08", name: "Rajasthan", isUnionTerritoryWithoutLegislature: false },
  {
    code: "09",
    name: "Uttar Pradesh",
    isUnionTerritoryWithoutLegislature: false,
  },
  { code: "10", name: "Bihar", isUnionTerritoryWithoutLegislature: false },
  { code: "11", name: "Sikkim", isUnionTerritoryWithoutLegislature: false },
  {
    code: "12",
    name: "Arunachal Pradesh",
    isUnionTerritoryWithoutLegislature: false,
  },
  { code: "13", name: "Nagaland", isUnionTerritoryWithoutLegislature: false },
  { code: "14", name: "Manipur", isUnionTerritoryWithoutLegislature: false },
  { code: "15", name: "Mizoram", isUnionTerritoryWithoutLegislature: false },
  { code: "16", name: "Tripura", isUnionTerritoryWithoutLegislature: false },
  { code: "17", name: "Meghalaya", isUnionTerritoryWithoutLegislature: false },
  { code: "18", name: "Assam", isUnionTerritoryWithoutLegislature: false },
  {
    code: "19",
    name: "West Bengal",
    isUnionTerritoryWithoutLegislature: false,
  },
  { code: "20", name: "Jharkhand", isUnionTerritoryWithoutLegislature: false },
  { code: "21", name: "Odisha", isUnionTerritoryWithoutLegislature: false },
  {
    code: "22",
    name: "Chhattisgarh",
    isUnionTerritoryWithoutLegislature: false,
  },
  {
    code: "23",
    name: "Madhya Pradesh",
    isUnionTerritoryWithoutLegislature: false,
  },
  { code: "24", name: "Gujarat", isUnionTerritoryWithoutLegislature: false },
  {
    code: "26",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    isUnionTerritoryWithoutLegislature: true,
  },
  {
    code: "27",
    name: "Maharashtra",
    isUnionTerritoryWithoutLegislature: false,
  },
  { code: "29", name: "Karnataka", isUnionTerritoryWithoutLegislature: false },
  { code: "30", name: "Goa", isUnionTerritoryWithoutLegislature: false },
  { code: "31", name: "Lakshadweep", isUnionTerritoryWithoutLegislature: true },
  { code: "32", name: "Kerala", isUnionTerritoryWithoutLegislature: false },
  { code: "33", name: "Tamil Nadu", isUnionTerritoryWithoutLegislature: false },
  { code: "34", name: "Puducherry", isUnionTerritoryWithoutLegislature: false },
  {
    code: "35",
    name: "Andaman and Nicobar Islands",
    isUnionTerritoryWithoutLegislature: true,
  },
  { code: "36", name: "Telangana", isUnionTerritoryWithoutLegislature: false },
  {
    code: "37",
    name: "Andhra Pradesh",
    isUnionTerritoryWithoutLegislature: false,
  },
  { code: "38", name: "Ladakh", isUnionTerritoryWithoutLegislature: true },
  {
    code: "97",
    name: "Other Territory",
    isUnionTerritoryWithoutLegislature: true,
  },
  {
    code: "99",
    name: "Centre Jurisdiction",
    isUnionTerritoryWithoutLegislature: false,
  },
];

/**
 * Legacy codes that still appear in older GSTINs (25 Daman and Diu, merged into
 * 26 in 2020; 28 old Andhra Pradesh before 37). Valid in a GSTIN, never offered
 * as a place of supply.
 */
export const LEGACY_GSTIN_STATE_CODES = ["25", "28"] as const;

/** Place-of-supply code for supplies outside India (exports). */
export const PLACE_OF_SUPPLY_OUTSIDE_INDIA = "96";

export const GST_STATES_BY_CODE: ReadonlyMap<string, GstState> = new Map(
  GST_STATES.map((state) => [state.code, state]),
);

/**
 * GST rates (percent) the engine accepts. The September 2025 rate
 * rationalisation moved most goods to 5% and 18%, with 40% for a small set of
 * goods. 12% and 28% stay valid for older documents and remaining exceptions.
 * Verify against current CBIC rate notifications before each release.
 */
export const GST_RATES = [
  0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 12, 18, 28, 40,
] as const;

/** How a contact is registered under GST; drives tax treatment and GSTR-1 tables. */
export enum GstTreatment {
  RegisteredRegular = "registered_regular",
  RegisteredComposition = "registered_composition",
  Unregistered = "unregistered",
  Consumer = "consumer",
  Overseas = "overseas",
  SpecialEconomicZone = "sez",
  DeemedExport = "deemed_export",
}

export enum GstSupplyType {
  /** Supplier location and place of supply are in the same state or UT. */
  IntraState = "intra_state",
  /** Different states, exports and SEZ supplies. */
  InterState = "inter_state",
}

export const GST_ERRORS = {
  GSTIN_INVALID_LENGTH: "GSTIN_INVALID_LENGTH",
  GSTIN_INVALID_FORMAT: "GSTIN_INVALID_FORMAT",
  GSTIN_INVALID_STATE_CODE: "GSTIN_INVALID_STATE_CODE",
  GSTIN_INVALID_CHECKSUM: "GSTIN_INVALID_CHECKSUM",
  INVALID_PLACE_OF_SUPPLY: "INVALID_PLACE_OF_SUPPLY",
  INVALID_SUPPLIER_STATE: "INVALID_SUPPLIER_STATE",
  INVALID_GST_RATE: "INVALID_GST_RATE",
  INVALID_HSN_SAC: "INVALID_HSN_SAC",
  NEGATIVE_TAXABLE_VALUE: "NEGATIVE_TAXABLE_VALUE",
} as const;
