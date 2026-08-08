import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendEmail, purchaseConfirmationEmail } from "@/lib/email";
import { getOrderNotificationWhatsAppUrl } from "@/lib/whatsapp";

const VerifySchema = z.object({
  orderId: z.string(), // our internal order id
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  const body = VerifySchema.parse(await req.json());

  // Get the order with its items and products to find the Razorpay account
  const order = await db.order.findUnique({
    where: { id: body.orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              razorpayAccount: true
            }
          }
        }
      }
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Get the Razorpay account from the first product
  const razorpayAccount = order.items[0]?.product.razorpayAccount || null;
  const keySecret = razorpayAccount?.keySecret || undefined;

  const valid = verifyRazorpaySignature(
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature,
    keySecret
  );

  if (!valid) {
    await db.order.update({ where: { id: body.orderId }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  const updatedOrder = await db.order.update({
    where: { id: body.orderId },
    data: { status: "PAID", razorpayPaymentId: body.razorpay_payment_id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { title: true } } } },
    },
  });

  if (updatedOrder.couponId) {
    await db.coupon.update({ where: { id: updatedOrder.couponId }, data: { usedCount: { increment: 1 } } });
  }

  // Send purchase confirmation email (console-logged in dev, real email in prod)
  try {
    const recipientEmail = updatedOrder.user?.email || updatedOrder.guestEmail;
    const recipientName = updatedOrder.user?.name || updatedOrder.guestName || "Customer";
    
    if (recipientEmail) {
      const html = purchaseConfirmationEmail(
        recipientName,
        updatedOrder.orderNumber,
        updatedOrder.items.map((i) => ({ title: i.product.title, price: i.price })),
        updatedOrder.amount
      );
      await sendEmail({
        to: recipientEmail,
        subject: `Order Confirmed — ${updatedOrder.orderNumber}`,
        html,
      });
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send confirmation:", err);
  }

  // Send WhatsApp notification (log URL for server-side, client will handle opening)
  try {
    const whatsappUrl = getOrderNotificationWhatsAppUrl({
      orderNumber: updatedOrder.orderNumber,
      guestName: updatedOrder.guestName,
      guestEmail: updatedOrder.guestEmail,
      guestPhone: updatedOrder.guestPhone,
      amount: updatedOrder.amount,
      items: updatedOrder.items.map((item) => ({ title: item.product.title, price: item.price })),
    });
  } catch (err) {
    console.error("[WHATSAPP] Failed to generate notification URL:", err);
  }

  return NextResponse.json({ success: true, orderId: updatedOrder.id });
}