import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  const { orderId } = await params;
  
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { title: true } } } },
      user: session?.user ? { select: { name: true, email: true } } : false,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Check if user has access to this order
  const isOwner = session?.user && (order.userId === session.user.id || order.userId === null);
  const isGuest = !session?.user && order.guestEmail;
  
  if (!isOwner && !isGuest) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Return order data (excluding sensitive information)
  return NextResponse.json({
    orderNumber: order.orderNumber,
    guestName: order.guestName,
    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone,
    amount: order.amount,
    status: order.status,
    items: order.items.map((i) => ({
      title: i.product.title,
      price: i.price,
    })),
  });
}