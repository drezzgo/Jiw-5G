import type { TrafficDataProvider } from "./TrafficDataProvider";
import type { TrafficSnapshot } from "../types";

export class ReplayTrafficProvider implements TrafficDataProvider {
  constructor(private readonly replay: TrafficSnapshot) {}

  async getSnapshot(): Promise<TrafficSnapshot> {
    return structuredClone(this.replay);
  }
}
