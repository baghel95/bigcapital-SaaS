import {
  GST_ERRORS,
  GstSupplyType,
  calculateGstLine,
  computeGstinCheckChar,
  getGstinStateCode,
  getSupplyType,
  normalizeGstin,
  roundToPaise,
  sumGstLines,
  validateGstin,
  validateHsnSac,
} from './index';

describe('GSTIN validation', () => {
  it('accepts a published valid GSTIN and extracts state and PAN', () => {
    expect(validateGstin('27AAPFU0939F1ZV')).toEqual({
      valid: true,
      gstin: '27AAPFU0939F1ZV',
      stateCode: '27',
      isRegularTaxpayer: true,
      pan: 'AAPFU0939F',
    });
  });

  it('normalizes case, spaces and dashes', () => {
    expect(normalizeGstin(' 27aapfu0939f1zv ')).toBe('27AAPFU0939F1ZV');
    expect(validateGstin('27-aapfu-0939f-1zv').valid).toBe(true);
  });

  it('rejects a wrong check character', () => {
    expect(validateGstin('27AAPFU0939F1ZW').error).toBe(
      GST_ERRORS.GSTIN_INVALID_CHECKSUM,
    );
  });

  it('rejects wrong length, bad characters and unknown state codes', () => {
    expect(validateGstin('27AAPFU0939F1Z').error).toBe(
      GST_ERRORS.GSTIN_INVALID_LENGTH,
    );
    expect(validateGstin('27AAPFU0939F1Z@').error).toBe(
      GST_ERRORS.GSTIN_INVALID_FORMAT,
    );

    const body = '50AAPFU0939F1Z';
    expect(validateGstin(body + computeGstinCheckChar(body)).error).toBe(
      GST_ERRORS.GSTIN_INVALID_STATE_CODE,
    );
  });

  it('accepts legacy state codes in old GSTINs', () => {
    const body = '28AAPFU0939F1Z';
    expect(validateGstin(body + computeGstinCheckChar(body)).valid).toBe(true);
  });

  it('accepts non-regular registrations but flags them', () => {
    // TDS deductor style: 14th character is not Z.
    const body = '07DELA12345B1D';
    const result = validateGstin(body + computeGstinCheckChar(body));
    expect(result.valid).toBe(true);
    expect(result.isRegularTaxpayer).toBe(false);
    expect(result.pan).toBeUndefined();
  });

  it('returns the state code only for valid GSTINs', () => {
    expect(getGstinStateCode('27AAPFU0939F1ZV')).toBe('27');
    expect(getGstinStateCode('27AAPFU0939F1ZW')).toBeNull();
  });
});

describe('HSN / SAC validation', () => {
  it.each([
    ['8471', 'hsn'],
    ['847130', 'hsn'],
    ['84713010', 'hsn'],
    ['998314', 'sac'],
    ['9983.14', 'sac'],
  ])('accepts %s as %s', (code, kind) => {
    expect(validateHsnSac(code)).toMatchObject({ valid: true, kind });
  });

  it.each(['84', '84713', '847130101', '99831', 'ABCD', ''])(
    'rejects %s',
    (code) => {
      expect(validateHsnSac(code).valid).toBe(false);
    },
  );
});

describe('supply type', () => {
  it('is intra-state when supplier and place of supply match', () => {
    expect(
      getSupplyType({ supplierStateCode: '27', placeOfSupplyStateCode: '27' }),
    ).toBe(GstSupplyType.IntraState);
  });

  it('is inter-state across states, for exports and for SEZ supplies', () => {
    expect(
      getSupplyType({ supplierStateCode: '27', placeOfSupplyStateCode: '29' }),
    ).toBe(GstSupplyType.InterState);
    expect(
      getSupplyType({ supplierStateCode: '27', placeOfSupplyStateCode: '96' }),
    ).toBe(GstSupplyType.InterState);
    expect(
      getSupplyType({
        supplierStateCode: '27',
        placeOfSupplyStateCode: '27',
        isSezSupply: true,
      }),
    ).toBe(GstSupplyType.InterState);
  });

  it('rejects unknown state codes', () => {
    expect(() =>
      getSupplyType({ supplierStateCode: '27', placeOfSupplyStateCode: '25' }),
    ).toThrow(GST_ERRORS.INVALID_PLACE_OF_SUPPLY);
    expect(() =>
      getSupplyType({ supplierStateCode: '96', placeOfSupplyStateCode: '27' }),
    ).toThrow(GST_ERRORS.INVALID_SUPPLIER_STATE);
  });
});

describe('GST line calculation', () => {
  const maharashtra = { supplierStateCode: '27', placeOfSupplyStateCode: '27' };
  const toKarnataka = { supplierStateCode: '27', placeOfSupplyStateCode: '29' };

  it('splits intra-state tax into equal CGST and SGST', () => {
    expect(
      calculateGstLine({ amount: 10000, rate: 18 }, maharashtra),
    ).toMatchObject({
      supplyType: GstSupplyType.IntraState,
      taxableValue: 10000,
      cgst: 900,
      sgst: 900,
      igst: 0,
      totalTax: 1800,
      lineTotal: 11800,
      isUtgst: false,
    });
  });

  it('charges IGST on inter-state supplies', () => {
    expect(
      calculateGstLine({ amount: 10000, rate: 18 }, toKarnataka),
    ).toMatchObject({
      supplyType: GstSupplyType.InterState,
      cgst: 0,
      sgst: 0,
      igst: 1800,
      totalTax: 1800,
    });
  });

  it('keeps CGST equal to SGST when the half rounds', () => {
    // 18% of 333.33 = 59.9994 -> each half 29.9997 -> 30.00
    const line = calculateGstLine({ amount: 333.33, rate: 18 }, maharashtra);
    expect(line.cgst).toBe(30);
    expect(line.sgst).toBe(line.cgst);
    expect(line.totalTax).toBe(60);
  });

  it('marks UTGST for intra-territory supplies in UTs without legislature', () => {
    const chandigarh = {
      supplierStateCode: '04',
      placeOfSupplyStateCode: '04',
    };
    expect(
      calculateGstLine({ amount: 1000, rate: 5 }, chandigarh),
    ).toMatchObject({
      cgst: 25,
      sgst: 25,
      isUtgst: true,
    });
    // Delhi has a legislature: SGST, not UTGST.
    const delhi = { supplierStateCode: '07', placeOfSupplyStateCode: '07' };
    expect(calculateGstLine({ amount: 1000, rate: 5 }, delhi).isUtgst).toBe(
      false,
    );
  });

  it('backs out tax from tax-inclusive amounts', () => {
    const line = calculateGstLine(
      { amount: 1180, rate: 18, isTaxInclusive: true },
      maharashtra,
    );
    expect(line.taxableValue).toBe(1000);
    expect(line.totalTax).toBe(180);
    expect(line.lineTotal).toBe(1180);
  });

  it('adds compensation cess on top of GST', () => {
    const line = calculateGstLine(
      { amount: 1000, rate: 28, cessRate: 12 },
      toKarnataka,
    );
    expect(line).toMatchObject({
      igst: 280,
      cess: 120,
      totalTax: 400,
      lineTotal: 1400,
    });
  });

  it('computes but does not charge tax under reverse charge', () => {
    const line = calculateGstLine(
      { amount: 1000, rate: 18 },
      { ...maharashtra, isReverseCharge: true },
    );
    expect(line.totalTax).toBe(180);
    expect(line.taxChargedOnInvoice).toBe(0);
    expect(line.lineTotal).toBe(1000);
  });

  it('handles zero-rated lines', () => {
    expect(
      calculateGstLine({ amount: 500, rate: 0 }, maharashtra),
    ).toMatchObject({
      totalTax: 0,
      lineTotal: 500,
    });
  });

  it('rejects unsupported rates and negative amounts', () => {
    expect(() =>
      calculateGstLine({ amount: 100, rate: 17 }, maharashtra),
    ).toThrow('Invalid GST rate: 17');
    expect(() =>
      calculateGstLine({ amount: -1, rate: 18 }, maharashtra),
    ).toThrow(GST_ERRORS.NEGATIVE_TAXABLE_VALUE);
  });
});

describe('document totals', () => {
  it('sums lines and rounds the invoice to the nearest rupee', () => {
    const context = { supplierStateCode: '27', placeOfSupplyStateCode: '27' };
    const lines = [
      calculateGstLine({ amount: 999.5, rate: 18 }, context),
      calculateGstLine({ amount: 250.25, rate: 5 }, context),
    ];
    const totals = sumGstLines(lines);

    // 999.50 -> 89.96 + 89.96 ; 250.25 -> 6.26 + 6.26
    expect(totals).toMatchObject({
      taxableValue: 1249.75,
      cgst: 96.22,
      sgst: 96.22,
      igst: 0,
      totalTax: 192.44,
      total: 1442.19,
      roundedTotal: 1442,
      roundOff: -0.19,
    });
  });

  it('rounds half away from zero', () => {
    expect(roundToPaise(1.005)).toBe(1.01);
    expect(roundToPaise(-1.005)).toBe(-1.01);
  });
});
