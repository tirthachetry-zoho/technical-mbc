import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendEmail, purchaseConfirmationEmail } from "@/lib/email";

const VerifySchema = z.object({
  orderId: z.string(), // our internal order id
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  const body = VerifySchema.parse(await req.json());

  const valid = verifyRazorpaySignature(
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature
  );

  if (!valid) {
    await db.order.update({ where: { id: body.orderId }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id: body.orderId },
    data: { status: "PAID", razorpayPaymentId: body.razorpay_payment_id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { title: true } } } },
    },
  });

  if (order.couponId) {
    await db.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });
  }

  // Send purchase confirmation email (console-logged in dev, real email in prod)
  try {
    const recipientEmail = order.user?.email;
    const recipientName = order.user?.name || order.user?.email || "Customer";
    
    if (recipientEmail) {
      const html = purchaseConfirmationEmail(
        recipientName,
        order.orderNumber,
        order.items.map((i) => ({ title: i.product.title, price: i.price })),
        order.amount
      );
      await sendEmail({
        to: recipientEmail,
        subject: `Order Confirmed — ${order.orderNumber}`,
        html,
      });
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send confirmation:", err);
  }

  return NextResponse.json({ success: true, orderId: order.id });
}