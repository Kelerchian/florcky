# Florcky

Function fork and resource lock made simple for node and browser app.

```
npm install florcky
```

Florcky package provides 4 different functionalities:

- TypedEvent: TypeScript friendly string-keyed event-emitter for in-application far components communication.
- forkJob: Promise-based utility for forking Promise-based job.
- mapCache: Map based resource caching with expiry
- MapResourceLock: Map and Promise based resource lock

## Usage Examples

Examples are available in [examples](examples) 

## TypedEvent

TypedEvent is EventEmitter like class with strict TypeScript type feature to list its events.

Example: Telemetry module

```typescript
// telemetry.js
import { TypedEvent } from "florcky";

export const telemetryEvents = new TypedEvent<{
  // list of event name and its payload
  navigate: {
    pathname: string;
  };
  enable: boolean;
}>();

let enabled = false;
telemetryEvents.subscribe("enable", (value) => {
  enabled = value;
});
telemetryEvents.subscribe("navigate", (navigation) => {
  if (!enabled) return;
  //...send navigation.pathname to telemetry service
});

// otherfile.js
import { telemetryEvents } from "./telemetry";

telemetryEvents.emit("navigate", window.location.pathname);
```

## forkJob

ForkJob forks function that returns promise and allow a number of the same function running.

```typescript
import { forkJob } from "florcky";

const someLongRunningJobForks = forkJob(async () => {
  // ...
});

someLongRunningJobForks.setMaxJob(3);
someLongRunningJobForks.getMaxJob(); // 3

someLongRunningJobForks.run(); // promise
someLongRunningJobForks.run(); // promise
someLongRunningJobForks.getActiveJobCount(); // 2

someLongRunningJobForks.run(); // promise

// .run() will return null if it is unable to run the job due to maximum job allowed
someLongRunningJobForks.run(); // null
someLongRunningJobForks.run(); // null
```

## mapCache

MapCache is a map based resource cache with expiry that .

```typescript
import { makeMapCache } from "florcky";

const cache = makeMapCache<string>({
  expiry: 3000,
});

// cache.get will run the function if current item is null or expired
// cache.get will return the cached item if exist whether it is expired or not
cache.get("1", () => Promise.resolve("hello"));
// Promise{ value: "hello" }

// cache.removeExpired does nothing if item is not expired
cache.removeExpired("1")

// cache.getImmediate is the sync variant of get
cache.getImmediate("1");      
// "hello"

cache.isExpired("1")          
// false

// Manually set an item with custom expiry
// expiry can be omitted
cache.set("somekey", "hello", 5000)

cache.fetch("someotherkey", () => Promise.resolve("world"))

// cached resource with id 1 will be expired in 3000 milliseconds
setTimeout(() => {
  cache.isExpired("1")        
  // false
  cache.removeExpired("1")

  cache.getImmediate("1")     
  // null
},3000)

setInterval(() => cache.clean(), 1000)
// remove expired cache item on interval
```

## MapResourceLock

MapResourceLock is a Map based resource lock used to constrain Promise based function from running multiple times

```typescript
import { MapResourceLock } from "florcky";

// create a lock for a string resource
const lock = new MapResourceLock<string>();
const promise = lock.run("someid", "someresource" , async () => {
  await new Promise(res => setTimeout(res, 3000))
  return "someresult"
})
lock.isLocked("someid") // true
lock.getLockedResource("someid") // "someresource"

// lock.run will return null if function cannot be executed
lock.run("someid", "resource", async () => {

}) // null

await promise // "someresult"


// lock.run will be run if resource can be run again
lock.run("someid", "resource", async () => {

}) // promise
```
