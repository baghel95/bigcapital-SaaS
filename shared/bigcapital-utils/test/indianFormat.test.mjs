import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyIndianGrouping,
  formatINR,
  groupIndianDigits,
  usesIndianGrouping,
} from '../dist/index.mjs';

test('groups digits the Indian way', () => {
  assert.equal(groupIndianDigits('0'), '0');
  assert.equal(groupIndianDigits('999'), '999');
  assert.equal(groupIndianDigits('1000'), '1,000');
  assert.equal(groupIndianDigits('100000'), '1,00,000');
  assert.equal(groupIndianDigits('1234567'), '12,34,567');
  assert.equal(groupIndianDigits('123456789'), '12,34,56,789');
});

test('re-groups already formatted amounts, keeping symbol and sign', () => {
  assert.equal(applyIndianGrouping('₹1,234,567.50'), '₹12,34,567.50');
  assert.equal(applyIndianGrouping('-₹100,000.00'), '-₹1,00,000.00');
  assert.equal(applyIndianGrouping('(₹100000)'), '(₹1,00,000)');
  assert.equal(applyIndianGrouping('₹999.99'), '₹999.99');
  assert.equal(applyIndianGrouping('12,345,678'), '1,23,45,678');
  assert.equal(applyIndianGrouping(''), '');
});

test('only touches the integer part, not the decimals', () => {
  assert.equal(applyIndianGrouping('₹1000000.123456'), '₹10,00,000.123456');
});

test('formats INR amounts', () => {
  assert.equal(formatINR(118000), '₹1,18,000.00');
  assert.equal(formatINR(-2500.5), '-₹2,500.50');
  assert.equal(formatINR(0), '₹0.00');
  assert.equal(formatINR(12345678.9, { precision: 0 }), '₹1,23,45,679');
});

test('applies only to INR', () => {
  assert.equal(usesIndianGrouping('INR'), true);
  assert.equal(usesIndianGrouping('inr'), true);
  assert.equal(usesIndianGrouping('USD'), false);
  assert.equal(usesIndianGrouping(undefined), false);
});
