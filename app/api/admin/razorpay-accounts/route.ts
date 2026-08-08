import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const RazorpayAccountSchema = z.object({
  name: z.string().min(1),
  keyId: z.string().min(1),
  keySecret: z.string().min(1),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

// GET - List all Razorpay accounts
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const accounts = await db.razorpayAccount.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyId: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Admin Razorpay accounts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Razorpay accounts" },
      { status: 500 }
    );
  }
}

// POST - Create a new Razorpay account
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = RazorpayAccountSchema.parse(body);

    // If setting this account as default, unset all other defaults
    if (data.isDefault) {
      await db.razorpayAccount.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.razorpayAccount.create({
      data,
    });

    // Don't expose keySecret in response
    const { keySecret, ...safeAccount } = account;

    return NextResponse.json(safeAccount, { status: 201 });
  } catch (error) {
    console.error("Create Razorpay account error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create Razorpay account" },
      { status: 500 }
    );
  }
}
