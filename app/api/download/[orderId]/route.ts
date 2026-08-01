import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getSignedDownloadUrl, getObjectBuffer } from "@/lib/r2";
import { MAX_DOWNLOADS_PER_ORDER } from "@/lib/download-token";
import { watermarkPdf } from "@/lib/watermark";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth();
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      downloads: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Check if user has access to this order
  const isLoggedInUser = session?.user && order.userId === session.user.id;
  
  // For guest orders (no userId), allow access if order is paid
  // They have the direct link which serves as authentication
  const isGuestOrder = !order.userId;
  const isGuestAccess = isGuestOrder && order.status === "PAID";
  
  if (!isLoggedInUser && !isGuestAccess) {
    return NextResponse.json({ error: "Unauthorized - Please login or access via order link" }, { status: 403 });
  }
  if (order.status !== "PAID") {
    return NextResponse.json({ error: "Order not paid" }, { status: 403 });
  }
  if (order.downloads.length >= MAX_DOWNLOADS_PER_ORDER) {
    return NextResponse.json({ error: "Download limit reached for this order" }, { status: 403 });
  }

  // Log every access attempt (IP, browser, time) for audit / abuse detection
  await db.download.create({
    data: {
      orderId: order.id,
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
      userAgent: req.headers.get("user-agent") ?? "unknown",
    },
  });

  // Get customer info for watermarking
  const customerName = order.guestName || order.user?.name || "Guest";
  const customerEmail = order.guestEmail || order.user?.email || "guest@example.com";

  // Try watermarking; if R2 is not configured, fall back to signed URLs
  try {
    const files = await Promise.all(
      order.items.map(async (item) => {
        try {
          // Fetch from R2, watermark, and return as base64 data
          const pdfBuffer = await getObjectBuffer(item.product.pdfKey);
          const watermarked = await watermarkPdf(pdfBuffer, {
            name: customerName,
            email: customerEmail,
            orderId: order.id,
          });
          return {
            title: item.product.title,
            watermarked: true,
            data: watermarked.toString("base64"),
          };
        } catch (r2Error) {
          console.error("R2 error:", r2Error);
          // R2 not configured — fall back to signed URL
          try {
            return {
              title: item.product.title,
              url: await getSignedDownloadUrl(item.product.pdfKey, 300),
            };
          } catch (urlError) {
            console.error("Signed URL error:", urlError);
            // If both fail, return placeholder message
            return {
              title: item.product.title,
              error: "PDF file not available. The admin needs to configure R2 storage or upload the PDF file.",
              pdfKey: item.product.pdfKey,
            };
          }
        }
      })
    );

    return NextResponse.json({
      files,
      remainingDownloads: MAX_DOWNLOADS_PER_ORDER - order.downloads.length - 1,
    });
  } catch (error) {
    console.error("Download generation error:", error);
    return NextResponse.json({ error: "Failed to generate downloads" }, { status: 500 });
  }
}