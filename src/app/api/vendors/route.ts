import { NextResponse } from "next/server";
import { createVendor, listVendors } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listVendors());
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body?.name || !body?.company || !body?.email) {
    return NextResponse.json(
      { error: "name, company, and email are required" },
      { status: 400 }
    );
  }
  const vendor = createVendor({
    name: body.name,
    company: body.company,
    email: body.email,
  });
  return NextResponse.json(vendor, { status: 201 });
}
