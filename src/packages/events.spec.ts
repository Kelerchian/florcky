import test from "ava";
import { TypedEvent } from "./events";

type EventType = {
  eventType1: string;
  eventType2: number;
};

test("TypedEvent should fire event to subscribed subscriber", (t) => {
  const events = new TypedEvent<EventType>();
  let valueForEventType1: string = "";
  let valueForEventType2: number = 0;

  events.subscribe("eventType1", (newValue) => {
    valueForEventType1 = newValue;
  });

  events.subscribe("eventType2", (newValue) => {
    valueForEventType2 = newValue;
  });

  events.emit("eventType1", "newValue");
  events.emit("eventType2", 1);

  t.is(valueForEventType1, "newValue");
  t.is(valueForEventType2, 1);
});

test("TypedEvent should uniquely register handler", (t) => {
  const events1 = new TypedEvent<EventType>();
  const events2 = new TypedEvent<EventType>();

  const array1 = [];
  const array2 = [];

  const handler1 = (_: string) => array1.push(1);
  const handler2A = (_: string) => array2.push(1);
  const handler2B = (_: string) => array2.push(1);
  const handler2C = (_: string) => array2.push(1);

  events1.subscribe("eventType1", handler1);
  events1.subscribe("eventType1", handler1);
  events1.subscribe("eventType1", handler1);
  events2.subscribe("eventType1", handler2A);
  events2.subscribe("eventType1", handler2B);
  events2.subscribe("eventType1", handler2C);

  events1.emit("eventType1", "");
  events2.emit("eventType1", "");

  t.is(array1.length, 1);
  t.is(array2.length, 3);
});

test("TypedEvent should not fire to unsubscribed subscriber via both unsubscribe method or function returned from subscribe", (t) => {
  const events1 = new TypedEvent<EventType>();
  const events2 = new TypedEvent<EventType>();

  let valueForEventType1: string = "";
  let valueForEventType2: string = "";

  const handler1 = (newValue: string) => (valueForEventType1 = newValue);

  const unsub2 = events2.subscribe("eventType1", (newValue) => {
    valueForEventType2 = newValue;
  });
  unsub2();
  events2.emit("eventType1", "newValue");

  events1.subscribe("eventType1", handler1);
  events1.unsubscribe("eventType1", handler1);
  events1.emit("eventType1", "newValue");

  t.is(valueForEventType2, "");
  t.is(valueForEventType1, "");
});

test("TypedEvent should not fire to cleared event", (t) => {
  const events = new TypedEvent<EventType>();
  const array = [];
  const handlerA = (_: string) => array.push(1);
  const handlerB = (_: string) => array.push(1);
  const handlerC = (_: string) => array.push(1);

  events.subscribe("eventType1", handlerA);
  events.subscribe("eventType1", handlerB);
  events.subscribe("eventType1", handlerC);
  events.clear("eventType1");

  events.emit("eventType1", "");

  t.is(array.length, 0);
});

test("TypedEvent clear event applies only on the designated eventType", (t) => {
  const events = new TypedEvent<EventType>();
  const array = [];
  const handlerA = (_: string) => array.push(1);
  const handlerB = (_: string) => array.push(1);
  const handlerC = (_: string) => array.push(1);

  events.subscribe("eventType1", handlerA);
  events.subscribe("eventType1", handlerB);
  events.subscribe("eventType1", handlerC);
  events.clear("eventType2");

  events.emit("eventType1", "");

  t.is(array.length, 3);
});
