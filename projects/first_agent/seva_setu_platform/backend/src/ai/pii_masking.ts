/**
 * Data Loss Prevention (DLP) Middleware for AI Requests
 * Ensures compliance with the DPDP Act by stripping or masking sensitive PII 
 * that is not required for processing or matching schemes.
 */
export function maskPII(text: string): string {
  if (!text) return text;

  // Mask 12-digit Aadhaar Numbers (e.g., 1234 5678 9123 or 123456789123)
  let masked = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "XXXX-XXXX-XXXX");
  
  // Mask 10-digit alphanumeric PAN Cards (e.g., ABCDE1234F)
  masked = masked.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, "XXXXX0000X");
  
  // Mask 10-digit Phone Numbers
  masked = masked.replace(/\b[6-9]\d{9}\b/g, "XXXXXX0000");
  
  // Mask typical Bank Account numbers (assuming 9 to 18 digit strings in context)
  // We use a more specific regex to avoid masking standard numbers/currency 
  masked = masked.replace(/\b(A\/C|Account)\s?:?\s?\d{9,18}\b/ig, "$1: XXXX-XXXX-XXXX");

  return masked;
}
