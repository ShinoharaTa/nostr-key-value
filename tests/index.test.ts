import { parseISO } from "date-fns";
import dotenv from "dotenv";
import { EventTemplate, finishEvent, relayInit } from "nostr-tools";
import { setTimeout } from "timers/promises";
import "websocket-polyfill";
import NostrKeyValue from "../src";

dotenv.config();

const npub = process.env.NPUB_HEX ?? "";
const nsec = process.env.NSEC_HEX ?? "";
const relays = ["wss://r.kojira.io"];

const relay = relayInit("wss://r.kojira.io");
relay.connect();
relay.on("error", () => {
  throw "failed to connect";
});

const post = async (ev: EventTemplate<30078> | null) => {
  if (!ev) return Promise.resolve("success");
  return new Promise((resolve, reject) => {
    const data = finishEvent(ev, nsec);
    const pub = relay.publish(data);
    pub.then(() => {
      resolve("success");
    });
    pub.catch(() => {
      reject("failed");
    });
  });
};

test("create", async () => {
  const nkv: NostrKeyValue = new NostrKeyValue(
    relays,
    npub,
    "nostr_key_value_create_test",
  );
  const items = {
    number: 123,
    string: "string_item",
    date: parseISO("2023-01-01T00:00:00.000Z"),
    null: null,
  };
  await post(await nkv.setItem("number", items.number));
  await setTimeout(1000);
  await post(await nkv.setItem("string", items.string));
  await setTimeout(1000);
  await post(await nkv.setItem("date", items.date));
  await setTimeout(1000);
  await post(await nkv.setItem("null", items.null));
  await setTimeout(1000);
  const result = await nkv.getItems();
  expect({
    number: "123",
    string: "string_item",
    date: "2023-01-01T00:00:00.000Z",
    null: "",
  }).toEqual(result);
}, 10000);

test("update", async () => {
  const nkv: NostrKeyValue = new NostrKeyValue(
    relays,
    npub,
    "nostr_key_value_update_test",
  );
  const items = ["shino3", "shino4", "shino5"];
  await post(await nkv.setItem("name", items[0]));
  await setTimeout(1000);
  await post(await nkv.setItem("name", items[1]));
  await setTimeout(1000);
  await post(await nkv.setItem("name", items[2]));
  await setTimeout(1000);
  const result = await nkv.getItem("name");
  expect(items[2]).toEqual(result);
}, 10000);

test("drop", async () => {
  const nkv: NostrKeyValue = new NostrKeyValue(
    relays,
    npub,
    "nostr_key_value_delete_test",
  );
  await post(await nkv.setItem("value1", "shino3"));
  await setTimeout(1000);
  await post(await nkv.setItem("value2", "shino4"));
  await setTimeout(1000);
  await post(await nkv.setItem("value3", "shino5"));
  await setTimeout(1000);
  const result_1 = await nkv.getItems();
  expect({ value1: "shino3", value2: "shino4", value3: "shino5" }).toEqual(
    result_1,
  );
  await post(await nkv.dropItem("value3"));
  await setTimeout(1000);
  const result_2 = await nkv.getItems();
  expect({ value1: "shino3", value2: "shino4" }).toEqual(result_2);
  await post(await nkv.dropItems());
  await setTimeout(1000);
  const result_3 = await nkv.getItems();
  expect({}).toEqual(result_3);
}, 20000);
