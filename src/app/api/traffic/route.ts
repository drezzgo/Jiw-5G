import { NextRequest, NextResponse } from "next/server";
import {
  buildTomTomIncidentBoundingBox,
  buildTomTomTrafficSnapshot,
  parseTomTomFlowResponse,
  parseTomTomIncidentCount,
  unavailableLiveTrafficSnapshot,
  validateTomTomPoint,
  type TomTomPoint,
} from "../../../traffic/tomtom";

export const dynamic = "force-dynamic";

const TOMTOM_FLOW_URL = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json";
const TOMTOM_INCIDENT_URL = "https://api.tomtom.com/traffic/services/5/incidentDetails";
const REQUEST_TIMEOUT_MS = 7_000;

function unavailable(message: string, status = 503) {
  return NextResponse.json(
    {
      ...unavailableLiveTrafficSnapshot(),
      message,
    },
    { status },
  );
}

function parsePoint(request: NextRequest): TomTomPoint {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");
  if (lat === null || lon === null || lat.trim() === "" || lon.trim() === "") {
    throw new Error("lat and lon query parameters are required.");
  }
  return validateTomTomPoint({ latitude: Number(lat), longitude: Number(lon) });
}

function flowRequestUrl(apiKey: string, point: TomTomPoint): URL {
  const url = new URL(TOMTOM_FLOW_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("point", `${point.latitude},${point.longitude}`);
  url.searchParams.set("unit", "KMPH");
  url.searchParams.set("openLr", "false");
  return url;
}

function incidentRequestUrl(apiKey: string, point: TomTomPoint): URL {
  const url = new URL(TOMTOM_INCIDENT_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("bbox", buildTomTomIncidentBoundingBox(point));
  url.searchParams.set("fields", "{incidents{type,properties{iconCategory}}}");
  url.searchParams.set("language", "es-ES");
  url.searchParams.set("timeValidityFilter", "present");
  return url;
}

async function fetchTomTom(url: URL): Promise<Response> {
  return fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

export async function GET(request: NextRequest) {
  let point: TomTomPoint;
  try {
    point = parsePoint(request);
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : "Invalid coordinates.", 400);
  }

  const apiKey = process.env.TOMTOM_API_KEY;
  if (!apiKey) {
    return unavailable("LIVE DATA UNAVAILABLE: TOMTOM_API_KEY is not configured on the server.");
  }

  try {
    const [flowResponse, incidentResponse] = await Promise.all([
      fetchTomTom(flowRequestUrl(apiKey, point)),
      fetchTomTom(incidentRequestUrl(apiKey, point)).catch(() => null),
    ]);

    if (!flowResponse.ok) {
      return unavailable(`LIVE DATA UNAVAILABLE: TomTom flow request returned HTTP ${flowResponse.status}.`);
    }

    const flow = parseTomTomFlowResponse(await flowResponse.json());
    let incidentCount: number | null = null;
    if (incidentResponse?.ok) {
      incidentCount = parseTomTomIncidentCount(await incidentResponse.json());
    }

    return NextResponse.json(buildTomTomTrafficSnapshot(flow, incidentCount));
  } catch {
    return unavailable("LIVE DATA UNAVAILABLE: TomTom could not be reached or returned an invalid response.");
  }
}
