import {
  getAll,
  getTable,
  getSingle,
  createTable,
  upsertTable,
  KeyValueArray,
  clearTable,
  utilKeyValueArrayToObject,
  utilObjectToKeyValueArray,
  upsertTableOrCreate,
  createTableExists,
} from "../src";
import { relayInit, finishEvent } from "nostr-tools";
import dotenv from "dotenv";
import "websocket-polyfill";

dotenv.config();

const npub = process.env.NPUB_HEX ?? "";
const nsec = process.env.NSEC_HEX ?? "";
const relayUrl = process.env.RELAY ?? "";

const relay = relayInit(relayUrl);
relay.on("error", () => {
  throw "failed to connect";
});

const post = async (ev: any) => {
  return new Promise((resolve, reject) => {
    const data = finishEvent(ev, nsec);
    const pub = relay.publish(data);

    pub.on("ok", () => {
      // console.log("succeess!");
      resolve("success");
    });

    pub.on("failed", () => {
      // console.log("failed to send event");
      reject("failed");
    });
  });
};

const create = async () => {
  let table_ev: any = null;
  table_ev = createTable("test_table", "NostrKeyValue_TestTable");
  post(table_ev);
  table_ev = createTable("test_table2", "NostrKeyValue_TestTable");
  post(table_ev);
  table_ev = createTable("test_table3", "NostrKeyValue_TestTable");
  post(table_ev);
};

const insert = async () => {
  const options: KeyValueArray = [
    ["option1", "option"],
    ["option2", "option"],
    ["option3", "option"],
    ["option4", "option"],
    ["option5", "option"],
  ];
  const values: KeyValueArray = [
    ["key1", "value 1"],
    ["key2", "value 2"],
    ["key3", "value 3"],
    ["key4", "value 4"],
    ["key5", "value 5"],
  ];
  const ev = await upsertTable([relayUrl], npub, "test_table", options, values);
  post(ev);
};

const upsert = async () => {
  const options: KeyValueArray = [
    ["option3", "option_update"],
    ["option7", "option_update"],
  ];
  const values: KeyValueArray = [
    ["key2", "value 2_update"],
    ["key9", "value 9_update"],
  ];
  const ev = await upsertTable([relayUrl], npub, "test_table", options, values);
  post(ev);
};

const get = async () => {
  const all = await getAll([relayUrl], npub, 10);
  console.log(all);

  const table = await getTable([relayUrl], npub, "test_table");
  console.log("table", table);

  const single = await getSingle([relayUrl], npub, "test_table", "key1");
  console.log("single", single);
};

const clear = async () => {
  let ev: any = null;
  ev = await clearTable([relayUrl], npub, "test_table", 0);
  expect(ev).not.toBeNull();
  post(ev);
  ev = await clearTable([relayUrl], npub, "test_table", 0);
  expect(ev).not.toBeNull();
  post(ev);
  ev = await clearTable([relayUrl], npub, "test_table", 0);
  expect(ev).not.toBeNull();
  post(ev);
};

const exists = async () => {
  await upsertTableOrCreate(
    [relayUrl],
    npub,
    "update_table_or_create",
    "table_title",
    [],
    []
  );
  await createTableExists(
    [relayUrl],
    npub,
    "update_table_or_create",
    "table_title"
  );
};

const util = () => {
  const obj = {
    test1: "value1",
    test2: "value2",
    test3: "value3",
    test4: "value4",
  };
  const result1 = utilObjectToKeyValueArray(obj);
  const result2 = utilKeyValueArrayToObject(result1);
  expect(result2).toEqual(obj);
};

test("default", async () => {
  await relay.connect();
  await create();
  await insert();
  await upsert();
  await get();
  await clear();
  await exists();
  util();
});
