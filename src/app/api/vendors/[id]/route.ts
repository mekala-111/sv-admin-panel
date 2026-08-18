import { NextResponse } from "next/server";
import { getVendor } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/vendors/[id]">
) {
  const { id } = await ctx.params;
  const vendor = getVendor(Number(id));
  if (!vendor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(vendor);
}
