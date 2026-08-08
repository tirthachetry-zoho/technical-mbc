import Razorpay from "razorpay";
import crypto from "crypto";

// Default Razorpay instance (for backward compatibility)
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Get Razorpay instance for a specific account
export function getRazorpayInstance(keyId: string, keySecret: string) {
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

// Verify signature with specific secret
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, keySecret?: string) {
  const secret = keySecret || process.env.RAZORPAY_KEY_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}
