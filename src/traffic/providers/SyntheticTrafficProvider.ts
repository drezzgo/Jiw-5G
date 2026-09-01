import type { TrafficDataProvider } from "./TrafficDataProvider";
import type { TrafficSnapshot } from "../types";

export class SyntheticTrafficProvider implements TrafficDataProvider {
  constructor(private readonly snapshot: TrafficSnapshot) {}

  async getSnapshot(): Promise<TrafficSnapshot> {
    return structuredClone(this.snapshot);
  }
}
