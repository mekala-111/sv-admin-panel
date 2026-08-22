import { NextResponse } from "next/server";
import { listTickets } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await listTickets());
}
