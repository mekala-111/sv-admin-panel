import { NextResponse } from "next/server";
import { getChannel } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/channels/[id]">
) {
  const { id } = await ctx.params;
  const channel = getChannel(Number(id));
  if (!channel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(channel);
}
