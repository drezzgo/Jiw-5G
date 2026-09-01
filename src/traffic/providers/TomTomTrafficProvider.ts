import type { TrafficDataProvider } from "./TrafficDataProvider";
import type { TrafficSnapshot } from "../types";

/** Browser-side provider. It calls our own Next.js route and never receives the API key. */
export class TomTomTrafficProvider implements TrafficDataProvider {
  async getSnapshot(): Promise<TrafficSnapshot> {
    const response = await fetch("/api/traffic", { cache: "no-store" });
    if (!response.ok) {
      return {
        source: "LIVE",
        timestamp: new Date().toISOString(),
        currentSpeedKmh: null,
        freeFlowSpeedKmh: null,
        currentTravelTimeSeconds: null,
        freeFlowTravelTimeSeconds: null,
        congestionLevel: "UNKNOWN",
        incidents: null,
        available: false,
      };
    }
    return response.json() as Promise<TrafficSnapshot>;
  }
}
