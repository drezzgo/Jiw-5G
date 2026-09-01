import type { EventBus, EventHandler } from "./EventBus";

export class LocalEventBus<T> implements EventBus<T> {
  private readonly handlers = new Set<EventHandler<T>>();

  publish(event: T): void {
    for (const handler of this.handlers) handler(event);
  }

  subscribe(handler: EventHandler<T>): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}
