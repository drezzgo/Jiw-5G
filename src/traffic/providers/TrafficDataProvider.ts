import type { TrafficSnapshot } from "../types";

export interface TrafficDataProvider {
  getSnapshot(): Promise<TrafficSnapshot>;
}
