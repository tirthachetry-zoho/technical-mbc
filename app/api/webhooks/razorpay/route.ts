import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { sendEmail, purchaseConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Optional signature verification if webhook secret is configured
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else if (!webhookSecret) {
      console.warn("RAZORPAY_WEBHOOK_SECRET not configured - proceeding without signature verification");
    }

    const event = JSON.parse(body);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const { order_id, payment_id, notes } = event.payload.payment.entity;
      const orderId = notes?.orderId;

      if (!orderId) {
        console.error("Order ID not found in payment notes");
        return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
      }

      // Find the order
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: { select: { title: true } } } },
          user: { select: { name: true, email: true } },
        },
      });

      if (!order) {
        console.error("Order not found:", orderId);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Update order status if not already paid
      if (order.status !== "PAID") {
        await db.order.update({
          where: { id: orderId },
          data: { status: "PAID", razorpayPaymentId: payment_id },
        });

        // Update coupon usage if applicable
        if (order.couponId) {
          await db.coupon.update({
            where: { id: order.couponId },
            data: { usedCount: { increment: 1 } },
          });
        }

        // Send confirmation email
        try {
          const recipientEmail = order.user?.email || order.guestEmail;
          const recipientName = order.user?.name || order.guestName || "Customer";

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

        console.log(`Payment captured for order ${orderId}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
