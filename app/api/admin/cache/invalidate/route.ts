import { NextRequest, NextResponse } from "next/server";
import { invalidateAll } from "@/lib/cache";

export async function POST() {
  // Simple protection - in production, add auth
  invalidateAll();
  return NextResponse.json({ status: "ok", message: "Cache invalidated" });
}