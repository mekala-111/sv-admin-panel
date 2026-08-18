import { NextResponse } from "next/server";
import { listEvents } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listEvents());
}
