import { get } from 'lodash';
import * as accounting from 'accounting';
import { applyIndianGrouping, usesIndianGrouping } from '@bigcapital/utils';
import { Currencies } from './currency-overrides';

const getNegativeFormat = (formatName) => {
  switch (formatName) {
    case 'parentheses':
      return '(%s%v)';
    case 'mines':
      return '-%s%v';
  }
};

const getCurrencySign = (currencyCode) => {
  return get(Currencies, `${currencyCode}.symbol`);
};

export interface IFormatNumberSettings {
  precision?: number;
  divideOn1000?: boolean;
  excerptZero?: boolean;
  negativeFormat?: string;
  thousand?: string;
  decimal?: string;
  zeroSign?: string;
  money?: boolean;
  currencyCode?: string;
  symbol?: string;
}

export const formatNumber = (
  balance,
  {
    precision = 2,
    divideOn1000 = false,
    excerptZero = false,
    negativeFormat = 'mines',
    thousand = ',',
    decimal = '.',
    zeroSign = '',
    money = true,
    currencyCode,
    symbol = '',
  }: IFormatNumberSettings,
) => {
  const formattedSymbol = getCurrencySign(currencyCode);
  const negForamt = getNegativeFormat(negativeFormat);
  const format = '%s%v';

  let formattedBalance = parseFloat(balance);

  if (divideOn1000) {
    formattedBalance /= 1000;
  }
  const formatted = accounting.formatMoney(
    formattedBalance,
    money ? formattedSymbol : symbol ? symbol : '',
    precision,
    thousand,
    decimal,
    {
      pos: format,
      neg: negForamt,
      zero: excerptZero ? zeroSign : format,
    },
  );
  // Lakh/crore grouping (1,00,000) for rupee amounts.
  return usesIndianGrouping(currencyCode) && thousand
    ? applyIndianGrouping(formatted, thousand, decimal)
    : formatted;
};
