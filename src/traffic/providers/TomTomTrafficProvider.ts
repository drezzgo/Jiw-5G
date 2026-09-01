import type { TrafficDataProvider } from "./TrafficDataProvider";
import type { TrafficSnapshot } from "../types";
import {
  unavailableLiveTrafficSnapshot,
  validateTomTomPoint,
  type TomTomPoint,
} from "../tomtom";

/** Browser-side provider. It calls our Next.js route; the API key never reaches the browser. */
export class TomTomTrafficProvider implements TrafficDataProvider {
  constructor(private readonly point: TomTomPoint) {
    validateTomTomPoint(point);
  }

  async getSnapshot(): Promise<TrafficSnapshot> {
    const query = new URLSearchParams({
      lat: String(this.point.latitude),
      lon: String(this.point.longitude),
    });

    try {
      const response = await fetch(`/api/traffic?${query.toString()}`, { cache: "no-store" });
      const body = await response.json().catch(() => null) as TrafficSnapshot | null;
      if (
        body
        && body.source === "LIVE"
        && typeof body.available === "boolean"
        && typeof body.timestamp === "string"
      ) {
        return body;
      }
      return unavailableLiveTrafficSnapshot();
    } catch {
      return unavailableLiveTrafficSnapshot();
    }
  }
}
