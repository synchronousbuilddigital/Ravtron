import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let cachedPincodes = null;

function getPincodesMap() {
  if (cachedPincodes) return cachedPincodes;
  try {
    const filePath = path.join(process.cwd(), "public", "pincodes.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      cachedPincodes = JSON.parse(raw);
      return cachedPincodes;
    }
  } catch (err) {
    console.error("[PINCODE_CACHE_ERROR]", err);
  }
  return null;
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const rawCode = resolvedParams?.code || "";
    const cleanPin = rawCode.replace(/\D/g, "");

    if (!cleanPin || cleanPin.length !== 6) {
      return NextResponse.json(
        { error: "Invalid PIN code. Must be 6 digits.", success: false },
        { status: 400 }
      );
    }

    const localMap = getPincodesMap();
    const localEntry = localMap && localMap[cleanPin] && localMap[cleanPin].length > 0 ? localMap[cleanPin][0] : null;

    if (localEntry) {
      return NextResponse.json({
        success: true,
        isServiceable: true,
        center: localEntry.center,
        state: localEntry.state,
        city: localEntry.center,
        areas: localEntry.areas || [],
        postOffice: (localEntry.areas && localEntry.areas[0]) || localEntry.center
      });
    }

    // Pincode not found in local serviceable delivery network
    return NextResponse.json({
      success: true,
      isServiceable: false,
      error: "Pincode is not in our serviceable delivery network.",
      city: "",
      state: "",
      center: "",
      areas: []
    });
  } catch (err) {
    console.error("[PINCODE_API_ERROR]", err);
    return NextResponse.json(
      { error: "PIN code lookup service unavailable", success: false },
      { status: 500 }
    );
  }
}

