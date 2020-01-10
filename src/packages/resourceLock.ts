import { TypedEvent } from "./events";

export class MapResourceLock<ResourceType> {
  mapLock: Map<string, ResourceType> = new Map();
  events = new TypedEvent<{
    locked: { id: string; resource: ResourceType };
    unlocked: { id: string; resource: ResourceType };
  }>();
  run<T>(
    id: string,
    resource: ResourceType,
    fn: () => Promise<T>
  ): Promise<T> | null {
    const mapLock = this.mapLock;
    if (this.isLocked(id)) return null;

    const job = fn();
    mapLock.set(id, resource);
    this.events.emit("locked", { id, resource });
    job.finally(() => {
      mapLock.delete(id);
      this.events.emit("unlocked", { id, resource });
    });

    return job;
  }
  isLocked(id: string) {
    return this.mapLock.has(id);
  }
  getLockedResource(id: string) {
    return this.mapLock.get(id);
  }
}

// export class SetResourceLock<ResourceType> {
//   setLock: Set<ResourceType> = new Set();
//   run<T>(resource: ResourceType, fn: () => Promise<T>): Promise<T> | null {
//     const mapLock = this.setLock;
//     if (this.isLocked(resource)) return null;
//
//     const job = fn();
//     mapLock.add(resource);
//     job.finally(() => mapLock.delete(resource));
//
//     return job;
//   }
//   isLocked(resource: ResourceType) {
//     return this.setLock.has(resource);
//   }
// }
