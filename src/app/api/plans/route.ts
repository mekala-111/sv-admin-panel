import { NextResponse } from "next/server";
import { listPlans } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listPlans());
}
