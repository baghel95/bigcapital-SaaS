/**
 * India GST engine. The pure logic (GSTIN/HSN validation, state master,
 * CGST/SGST/IGST calculation) lives in @bigcapital/utils so the server and the
 * web app share one implementation.
 */
export * from '@bigcapital/utils';
