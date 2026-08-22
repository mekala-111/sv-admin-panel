import { NextResponse } from "next/server";
import { listAuditLogs } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await listAuditLogs());
}
