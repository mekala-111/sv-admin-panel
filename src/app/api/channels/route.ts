import { NextResponse } from "next/server";
import { listChannels } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listChannels());
}
