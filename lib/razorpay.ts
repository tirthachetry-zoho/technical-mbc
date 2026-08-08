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

// Create Razorpay QR code for payment
export async function createRazorpayQRCode(amount: number, orderId: string, customerName?: string, customerEmail?: string) {
  try {
    const qrCode: any = await razorpay.qrCode.create({
      type: "upi_qr",
      name: "TechnicalMBC",
      description: `Payment for order ${orderId}`,
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amount * 100, // Convert to paise
      notes: {
        orderId: orderId,
        customerName: customerName || "Guest",
        customerEmail: customerEmail || "",
        amount: amount.toString(),
      },
    } as any);
    return qrCode;
  } catch (error) {
    console.error("Error creating Razorpay QR code:", error);
    throw error;
  }
}
