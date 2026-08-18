import { NextResponse } from "next/server";
import { listWalletTx } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listWalletTx());
}
