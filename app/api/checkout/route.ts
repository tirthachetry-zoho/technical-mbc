import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { invalidateOrders } from "@/lib/cache";
import { razorpay, getRazorpayInstance } from "@/lib/razorpay";

const CheckoutSchema = z.object({
  productIds: z.array(z.string()).min(1),
  couponCode: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  guestName: z.string().optional(),
}).refine((data) => {
  // If not logged in, require guest email, phone, and name
  const hasGuestInfo = data.guestEmail || data.guestPhone || data.guestName;
  if (hasGuestInfo) {
    return !!data.guestEmail && !!data.guestPhone && !!data.guestName;
  }
  return true;
}, {
  message: "Guest checkout requires email, phone, and name",
  path: ["guestEmail"],
});

export async function POST(req: NextRequest) {
  try {
    // Await headers BEFORE calling auth() to avoid Next.js 15 warnings
    const headers = await req.headers;
    const session = await auth();
    const body = await req.json();
    const { productIds, couponCode, guestEmail, guestPhone, guestName } = CheckoutSchema.parse(body);

    // Allow guest checkout if email is provided, otherwise require login
    if (!session?.user && !guestEmail) {
      return NextResponse.json({ error: "Login required or guest email required" }, { status: 401 });
    }

    const products = await db.product.findMany({ 
      where: { id: { in: productIds }, published: true },
      include: { razorpayAccount: true }
    });
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products unavailable" }, { status: 400 });
    }

    // Get Razorpay account from the first product (for single product checkout)
    const razorpayAccount = products[0]?.razorpayAccount || null;

    // Calculate amount in rupees (price is stored in paise in database)
    let amount = products.reduce((sum, p) => {
      const discountedPrice = Math.round(p.price * (1 - p.discountPct / 100));
      return sum + (discountedPrice / 100); // Convert paise to rupees
    }, 0);

    let coupon = null;
    if (couponCode) {
      coupon = await db.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon) return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });
      if (coupon.expiresAt && coupon.expiresAt < new Date())
        return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
        return NextResponse.json({ error: "Coupon limit reached" }, { status: 400 });
      if (amount < coupon.minOrderVal)
        return NextResponse.json({ error: "Order below coupon minimum" }, { status: 400 });

      amount = coupon.type === "FLAT" ? amount - coupon.value : Math.round(amount * (1 - coupon.value / 100));
      amount = Math.max(amount, 1); // never go below ₹1
    }

    const orderNumber = `ORD-${Date.now()}`;

    // Get customer details for Razorpay
    const customerName = session?.user?.name || guestName;
    const customerEmail = session?.user?.email || guestEmail;
    const customerPhone = guestPhone;

    // Create Razorpay order using the product's configured account or default
    const razorpayInstance = razorpayAccount 
      ? getRazorpayInstance(razorpayAccount.keyId, razorpayAccount.keySecret)
      : razorpay;

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: orderNumber,
      notes: {
        orderId: orderNumber,
        customerName: customerName || "Guest",
        customerEmail: customerEmail || "",
      },
    });

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id,
        guestEmail: session?.user ? undefined : guestEmail,
        guestPhone: session?.user ? undefined : guestPhone,
        guestName: session?.user ? undefined : guestName,
        amount,
        paymentMethod: "razorpay",
        razorpayOrderId: razorpayOrder.id,
        couponId: coupon?.id,
        items: { create: products.map((p) => ({ productId: p.id, price: p.price })) },
      },
    });

    invalidateOrders();

    return NextResponse.json({
      orderId: order.id,
      amount,
      razorpayOrderId: razorpayOrder.id,
      razorpayKey: razorpayAccount?.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}
