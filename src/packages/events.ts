export class TypedEvent<T> {
  subscribers: Map<keyof T, Set<Function>> = new Map();
  getSubscribers<K extends keyof T>(eventName: K) {
    let subscribers = this.subscribers.get(eventName);
    if (!subscribers) {
      subscribers = new Set();
      this.subscribers.set(eventName, subscribers);
    }
    return subscribers;
  }
  emit<K extends keyof T>(eventName: K, payload: T[K]) {
    return Array.from(this.getSubscribers(eventName)).map(subscriber =>
      subscriber(payload)
    );
  }
  subscribe<K extends keyof T>(
    eventName: K,
    subscriber: (payload: T[K]) => unknown
  ) {
    this.getSubscribers(eventName).add(subscriber);
    return () => this.getSubscribers(eventName).delete(subscriber);
  }
  unsubscribe<K extends keyof T>(
    eventName: K,
    subscriber: (payload: T[K]) => unknown
  ) {
    this.getSubscribers(eventName).delete(subscriber);
  }
  clear<K extends keyof T>(eventName: K): void {
    this.getSubscribers(eventName).clear();
  }
}
