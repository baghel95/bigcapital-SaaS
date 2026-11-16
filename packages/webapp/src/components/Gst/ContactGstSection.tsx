import React, { useEffect } from 'react';
import { Icon } from '@blueprintjs/core';
import { useFormikContext } from 'formik';
import * as Yup from 'yup';
import {
  GST_STATES,
  GstTreatment,
  PLACE_OF_SUPPLY_OUTSIDE_INDIA,
  validateGstin,
  GST_STATES_BY_CODE,
} from '@bigcapital/utils';
import { FFormGroup, FInputGroup, FSelect } from '@/components/Forms';

export interface ContactGstValues {
  gstTreatment: string;
  gstin: string;
  placeOfSupply: string;
}

export const contactGstInitialValues: ContactGstValues = {
  gstTreatment: '',
  gstin: '',
  placeOfSupply: '',
};

export const GST_TREATMENT_OPTIONS = [
  {
    key: GstTreatment.RegisteredRegular,
    label: 'Registered business – regular',
  },
  {
    key: GstTreatment.RegisteredComposition,
    label: 'Registered business – composition',
  },
  { key: GstTreatment.Unregistered, label: 'Unregistered business' },
  { key: GstTreatment.Consumer, label: 'Consumer' },
  { key: GstTreatment.Overseas, label: 'Overseas' },
  {
    key: GstTreatment.SpecialEconomicZone,
    label: 'Special Economic Zone (SEZ)',
  },
  { key: GstTreatment.DeemedExport, label: 'Deemed export' },
];

export const PLACE_OF_SUPPLY_OPTIONS = [
  ...GST_STATES.filter((s) => s.code !== '99').map((s) => ({
    key: s.code,
    label: `${s.name} (${s.code})`,
  })),
  { key: PLACE_OF_SUPPLY_OUTSIDE_INDIA, label: 'Outside India (96)' },
];

/** Treatments that carry a GSTIN. */
const TREATMENTS_WITH_GSTIN: string[] = [
  GstTreatment.RegisteredRegular,
  GstTreatment.RegisteredComposition,
  GstTreatment.SpecialEconomicZone,
  GstTreatment.DeemedExport,
];

export const treatmentHasGstin = (treatment?: string) =>
  !treatment || TREATMENTS_WITH_GSTIN.includes(treatment);

/** Yup rules for the GST fields; merge into a contact form schema. */
export const contactGstSchema = {
  gstTreatment: Yup.string().nullable(),
  gstin: Yup.string()
    .nullable()
    .test(
      'gstin',
      'Enter a valid 15-character GSTIN (check the last character).',
      (value) => !value || validateGstin(value).valid,
    ),
  placeOfSupply: Yup.string().nullable(),
};

/** Request-body fields from form values ('' clears a stored value). */
export const transformGstFormToRequest = (
  values: Partial<ContactGstValues>,
): {
  gstTreatment: `${GstTreatment}` | null;
  gstin: string | null;
  placeOfSupply: string | null;
} => ({
  gstTreatment: (values.gstTreatment || null) as `${GstTreatment}` | null,
  gstin: treatmentHasGstin(values.gstTreatment) ? values.gstin || null : null,
  placeOfSupply: values.placeOfSupply || null,
});

function GstinStatus({ gstin }: { gstin: string }) {
  if (!gstin) return null;
  const result = validateGstin(gstin);

  if (!result.valid) {
    return gstin.replace(/\s/g, '').length < 15 ? null : (
      <span className="g-gstin-status g-gstin-status--invalid">
        <Icon icon="cross-circle" size={12} /> Not a valid GSTIN
      </span>
    );
  }
  const state = GST_STATES_BY_CODE.get(result.stateCode as string);
  return (
    <span className="g-gstin-status g-gstin-status--valid">
      <Icon icon="tick-circle" size={12} /> Valid · {state?.name ?? 'Other'} (
      {result.stateCode}) · PAN {result.pan ?? '—'}
    </span>
  );
}

/**
 * GST details for customers and vendors: registration type, GSTIN (validated
 * as you type) and default place of supply (filled from the GSTIN state).
 */
export function ContactGstSection({ title }: { title: React.ReactNode }) {
  const { values, setFieldValue } = useFormikContext<ContactGstValues>();
  const showGstin = treatmentHasGstin(values.gstTreatment);

  // A valid GSTIN fills the place of supply when it is still empty.
  useEffect(() => {
    if (!values.gstin || values.placeOfSupply) return;
    const result = validateGstin(values.gstin);
    if (result.valid && GST_STATES_BY_CODE.has(result.stateCode as string)) {
      setFieldValue('placeOfSupply', result.stateCode);
    }
  }, [values.gstin, values.placeOfSupply, setFieldValue]);

  // Overseas contacts are supplied outside India.
  useEffect(() => {
    if (
      values.gstTreatment === GstTreatment.Overseas &&
      !values.placeOfSupply
    ) {
      setFieldValue('placeOfSupply', PLACE_OF_SUPPLY_OUTSIDE_INDIA);
    }
  }, [values.gstTreatment, values.placeOfSupply, setFieldValue]);

  return (
    <div data-section-id="gst">
      {title}

      <FFormGroup name={'gstTreatment'} label={'GST treatment'} inline>
        <FSelect
          name={'gstTreatment'}
          items={GST_TREATMENT_OPTIONS}
          valueAccessor={'key'}
          textAccessor={'label'}
          placeholder={'Select registration type'}
          filterable={false}
          popoverProps={{ minimal: true }}
        />
      </FFormGroup>

      {showGstin && (
        <FFormGroup
          name={'gstin'}
          label={'GSTIN'}
          inline
          helperText={<GstinStatus gstin={values.gstin} />}
        >
          <FInputGroup
            name={'gstin'}
            placeholder={'e.g. 27ABCDE1234F1Z5'}
            maxLength={18}
            style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
          />
        </FFormGroup>
      )}

      <FFormGroup
        name={'placeOfSupply'}
        label={'Place of supply'}
        inline
        helperText={'Decides CGST + SGST (same state) or IGST (other state).'}
      >
        <FSelect
          name={'placeOfSupply'}
          items={PLACE_OF_SUPPLY_OPTIONS}
          valueAccessor={'key'}
          textAccessor={'label'}
          placeholder={'Select state'}
          popoverProps={{ minimal: true }}
        />
      </FFormGroup>
    </div>
  );
}
