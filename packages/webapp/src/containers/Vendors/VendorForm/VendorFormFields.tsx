import { Divider } from '@blueprintjs/core';
import { css } from '@emotion/css';
import { VendorBillingAddress } from './VendorBillingAddress';
import { VendorFormBasicSection } from './VendorFormBasicSection';
import { VendorFormFinancialSection } from './VendorFormFinancialSection';
import { VendorFormNotesSection } from './VendorFormNotesSection';
import { VendorShippingAddress } from './VendorShippingAddress';
import { Box } from '@/components';
import { ContactGstSection } from '@/components/Gst/ContactGstSection';
import { VendorFormSectionTitle } from './VendorFormSectionTitle';

const vendorFormSectionDividerClass = css`
  margin: 20px 0;
`;

export function VendorFormSections() {
  return (
    <Box>
      <VendorFormBasicSection />
      <Divider className={vendorFormSectionDividerClass} />

      <ContactGstSection
        title={<VendorFormSectionTitle>GST details</VendorFormSectionTitle>}
      />
      <Divider className={vendorFormSectionDividerClass} />

      <VendorFormFinancialSection />
      <Divider className={vendorFormSectionDividerClass} />

      <VendorBillingAddress />
      <Divider className={vendorFormSectionDividerClass} />

      <VendorShippingAddress />
      <Divider className={vendorFormSectionDividerClass} />

      <VendorFormNotesSection />
    </Box>
  );
}
