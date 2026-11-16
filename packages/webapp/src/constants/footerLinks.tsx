import intl from 'react-intl-universal';
import { BRAND } from './brand';

export const getFooterLinks = (): Array<{ title: string; link: string }> => [
  {
    title: intl.get('docs'),
    link: BRAND.docsUrl,
  },
  {
    title: intl.get('community'),
    link: BRAND.communityUrl,
  },
  {
    title: 'Source code',
    link: BRAND.sourceCodeUrl,
  },
  {
    title: BRAND.name,
    link: BRAND.websiteUrl,
  },
];
