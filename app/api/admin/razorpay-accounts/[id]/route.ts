import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  keyId: z.string().min(1).optional(),
  keySecret: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

// PATCH - Update a Razorpay account
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    // If setting this account as default, unset all other defaults
    if (data.isDefault === true) {
      await db.razorpayAccount.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const account = await db.razorpayAccount.update({
      where: { id },
      data,
    });

    // Don't expose keySecret in response
    const { keySecret, ...safeAccount } = account;

    return NextResponse.json(safeAccount);
  } catch (error) {
    console.error("Update Razorpay account error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update Razorpay account" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a Razorpay account
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // Check if any products are using this account
    const productsUsingAccount = await db.product.count({
      where: { razorpayAccountId: id },
    });

    if (productsUsingAccount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productsUsingAccount} product(s) are using this Razorpay account` },
        { status: 400 }
      );
    }

    await db.razorpayAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Razorpay account error:", error);
    return NextResponse.json(
      { error: "Failed to delete Razorpay account" },
      { status: 500 }
    );
  }
}
