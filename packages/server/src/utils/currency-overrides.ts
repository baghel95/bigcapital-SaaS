import * as Currencies from 'js-money/lib/currency';
import { INR_SYMBOL } from '@bigcapital/utils';

/**
 * Corrections to js-money's currency table. js-money ships "Rs" for INR;
 * Ganak uses the rupee sign everywhere. Import this module before reading
 * currency symbols.
 */
if (Currencies?.INR) {
  Currencies.INR.symbol = INR_SYMBOL;
}

export { Currencies };
