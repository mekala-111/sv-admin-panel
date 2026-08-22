import { NextResponse } from "next/server";
import { listTransactions } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await listTransactions());
}
