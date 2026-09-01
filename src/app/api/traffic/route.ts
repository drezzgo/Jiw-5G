import { NextResponse } from "next/server";

/**
 * Phase 7 integration point. It deliberately does not call TomTom yet.
 * The key is read server-side only so the public contract is already safe.
 */
export async function GET() {
  const apiKeyConfigured = Boolean(process.env.TOMTOM_API_KEY);

  return NextResponse.json(
    {
      status: "LIVE_DATA_UNAVAILABLE",
      provider: "TOMTOM",
      apiKeyConfigured,
      message: "TomTom LIVE integration is reserved for Phase 7. Use DEMO or REPLAY.",
    },
    { status: 503 },
  );
}
