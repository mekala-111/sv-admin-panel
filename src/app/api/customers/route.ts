import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listCustomers());
}
