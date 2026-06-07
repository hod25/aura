/** Shared types and constants for the checkout feature. */

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
}

export const emptyCard: CardDetails = {
  number: '',
  name: '',
  expiry: '',
  cvc: '',
};

/** Flat shipping fee and tax rate used across the checkout summary. */
export const SHIPPING_FLAT = 0;
export const TAX_RATE = 0.08;
