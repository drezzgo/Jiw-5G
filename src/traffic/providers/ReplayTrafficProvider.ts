import type { TrafficDataProvider } from "./TrafficDataProvider";
import type { ReplayCapture, TrafficSnapshot } from "../types";

export class ReplayTrafficProvider implements TrafficDataProvider {
  private readonly replay: ReplayCapture;

  constructor(replay: ReplayCapture) {
    this.replay = structuredClone(replay);
  }

  async getSnapshot(): Promise<TrafficSnapshot> {
    return {
      ...structuredClone(this.replay.traffic),
      source: "REPLAY",
    };
  }
}
