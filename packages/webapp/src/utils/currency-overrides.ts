import Currencies from 'js-money/lib/currency';
import { INR_SYMBOL } from '@bigcapital/utils';

/**
 * Corrections to js-money's currency table, applied once at startup.
 * js-money ships "Rs" for INR; Ganak shows the rupee sign everywhere.
 */
const table = Currencies as Record<string, { symbol: string }>;
if (table?.INR) {
  table.INR.symbol = INR_SYMBOL;
}

export {};
