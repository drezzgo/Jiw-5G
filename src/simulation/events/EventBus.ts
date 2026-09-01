export type EventHandler<T> = (event: T) => void;

export interface EventBus<T> {
  publish(event: T): void;
  subscribe(handler: EventHandler<T>): () => void;
}
