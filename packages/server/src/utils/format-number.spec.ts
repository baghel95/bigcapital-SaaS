import { formatNumber } from './format-number';

describe('formatNumber', () => {
  it('formats INR with the rupee sign and lakh/crore grouping', () => {
    expect(formatNumber(118000, { currencyCode: 'INR' })).toBe('₹1,18,000.00');
    expect(formatNumber(12345678.9, { currencyCode: 'INR' })).toBe(
      '₹1,23,45,678.90',
    );
    expect(formatNumber(999, { currencyCode: 'INR' })).toBe('₹999.00');
  });

  it('keeps the negative format for INR', () => {
    expect(formatNumber(-250000, { currencyCode: 'INR' })).toBe(
      '-₹2,50,000.00',
    );
    expect(
      formatNumber(-250000, {
        currencyCode: 'INR',
        negativeFormat: 'parentheses',
      }),
    ).toBe('(₹2,50,000.00)');
  });

  it('groups INR numbers without a symbol when money is off', () => {
    expect(formatNumber(1500000, { currencyCode: 'INR', money: false })).toBe(
      '15,00,000.00',
    );
  });

  it('leaves other currencies grouped in thousands', () => {
    expect(formatNumber(1234567.5, { currencyCode: 'USD' })).toBe(
      '$1,234,567.50',
    );
  });
});
