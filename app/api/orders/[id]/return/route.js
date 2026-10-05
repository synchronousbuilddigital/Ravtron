import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Product returns and exchanges are not supported. Please reach out to customer support for warranty service." },
    { status: 400 }
  );
}

