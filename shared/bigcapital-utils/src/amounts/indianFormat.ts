/**
 * Indian number formatting helpers (lakh / crore grouping, rupee symbol).
 *
 * 1234567.5 -> "12,34,567.50": the last three integer digits form one group,
 * every group before that has two digits.
 */

export const INR_SYMBOL = "₹";

/** Currencies whose amounts are grouped the Indian way. */
const INDIAN_GROUPING_CURRENCIES = new Set(["INR"]);

export const usesIndianGrouping = (currencyCode?: string | null): boolean =>
  !!currencyCode && INDIAN_GROUPING_CURRENCIES.has(currencyCode.toUpperCase());

/** Groups a string of integer digits in the Indian style: "1234567" -> "12,34,567". */
export const groupIndianDigits = (digits: string, separator = ","): string => {
  if (digits.length <= 3) return digits;
  const lastThree = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const pairs = rest.replace(/\B(?=(\d{2})+(?!\d))/g, separator);
  return `${pairs}${separator}${lastThree}`;
};

/**
 * Re-groups the integer part of an already formatted amount the Indian way,
 * keeping any symbol, sign, parentheses and decimals around it.
 * "₹1,234,567.50" -> "₹12,34,567.50", "(₹100000)" -> "(₹1,00,000)".
 */
export const applyIndianGrouping = (
  formatted: string,
  separator = ",",
  decimal = ".",
): string => {
  if (typeof formatted !== "string" || formatted === "") return formatted;

  const escapedSep = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedDec = decimal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const integerRun = new RegExp(
    `\\d[\\d${escapedSep}]*(?=${escapedDec}|\\D|$)`,
  );

  return formatted.replace(integerRun, (run) =>
    groupIndianDigits(run.split(separator).join(""), separator),
  );
};

/** Formats a number as Indian rupees: 118000 -> "₹1,18,000.00". */
export const formatINR = (
  amount: number,
  {
    precision = 2,
    symbol = INR_SYMBOL,
  }: { precision?: number; symbol?: string } = {},
): string => {
  const value = Number.isFinite(amount) ? amount : 0;
  const negative = value < 0;
  const [int, dec] = Math.abs(value).toFixed(precision).split(".");
  const body = groupIndianDigits(int) + (dec ? `.${dec}` : "");
  return `${negative ? "-" : ""}${symbol}${body}`;
};
