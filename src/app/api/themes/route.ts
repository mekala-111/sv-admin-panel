import { NextResponse } from "next/server";
import { listThemes } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listThemes());
}
