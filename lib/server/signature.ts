import { createHmac, timingSafeEqual } from "node:crypto";

/* Checks a Paystack webhook signature (HMAC-SHA512 of the raw body). */
export function validSignature(raw: string, signatureHex: string, key: string): boolean {
  if (!key || !signatureHex) return false;
  const expected = createHmac("sha512", key).update(raw).digest();
  const given = Buffer.from(signatureHex, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
