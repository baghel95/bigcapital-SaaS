/**
 * Product branding in one place, so the name can change (pending trademark
 * search) without touching components.
 */
export const BRAND = {
  name: 'Ganak',
  tagline: 'GST accounting for Indian businesses',
  /** Legal entity shown in footers and payment notices. Replace once registered. */
  legalName: 'Ganak',
  websiteUrl: 'https://github.com/baghel95/bigcapital-SaaS',
  docsUrl: 'https://github.com/baghel95/bigcapital-SaaS#readme',
  communityUrl: 'https://github.com/baghel95/bigcapital-SaaS/discussions',
  /** Public source code (AGPL-3.0 section 13: offer source to network users). */
  sourceCodeUrl: 'https://github.com/baghel95/bigcapital-SaaS',
  basedOn: 'Built on the open-source Bigcapital project (AGPL-3.0).',
  colors: {
    primary: '#4F46E5',
    accent: '#06B6D4',
  },
} as const;
