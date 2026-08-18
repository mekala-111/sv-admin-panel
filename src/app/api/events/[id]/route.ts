import { NextResponse } from "next/server";
import { getEvent } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/events/[id]">
) {
  const { id } = await ctx.params;
  const event = getEvent(Number(id));
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(event);
}
