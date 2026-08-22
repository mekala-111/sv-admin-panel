import { NextResponse } from "next/server";
import { createNotification, listNotifications } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await listNotifications());
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.title || !body?.message) {
    return NextResponse.json(
      { error: "title and message are required" },
      { status: 400 }
    );
  }
  const notification = await createNotification({
    title: body.title,
    message: body.message,
    audience: body.audience ?? "All Vendors",
    type: body.type ?? "System",
  });
  return NextResponse.json(notification, { status: 201 });
}
