import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail, purchaseConfirmationEmail } from "@/lib/email";
import { invalidateOrders } from "@/lib/cache";

const VerifyManualSchema = z.object({
  orderId: z.string(),
});

export async function POST(req: NextRequest) {
  // Require authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins can manually verify payments
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
  }

  const { orderId } = VerifyManualSchema.parse(await req.json());

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { title: true } } } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({ success: true, orderId: order.id });
  }

  // For manual UPI payments, we'll mark as PAID
  // In production, you might want to add admin verification here
  const updatedOrder = await db.order.update({
    where: { id: orderId },
    data: { status: "PAID", paymentMethod: "upi_manual" },
    include: {
      items: { include: { product: { select: { title: true } } } },
    },
  });

  if (order.couponId) {
    await db.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });
  }

  // Send purchase confirmation email
  const recipientEmail = order.guestEmail || (order.user?.email ?? null);
  const recipientName = order.guestName || order.user?.name || recipientEmail || "Customer";

  if (recipientEmail) {
    try {
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
    } catch (err) {
      console.error("[EMAIL] Failed to send confirmation:", err);
    }
  }

  invalidateOrders();

  return NextResponse.json({ success: true, orderId: updatedOrder.id });
}
