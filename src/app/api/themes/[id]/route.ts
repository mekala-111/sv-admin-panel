import { NextResponse } from "next/server";
import { getTheme } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/themes/[id]">
) {
  const { id } = await ctx.params;
  const theme = await getTheme(id);
  if (!theme) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(theme);
}
