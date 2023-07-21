import { getAll, getTable, getSingle, createTable } from "../src";
import dotenv from "dotenv";

dotenv.config();

const npub = process.env.NPUB ?? "";
const relay = process.env.RELAY ?? "";

test("CreateTest", () => {
  let table = createTable("test_table", "NostrKeyValue_TestTable");
  
  //   const all = getAll([relay], npub, 10);
  //   console.log(all);

  //   const table = getTable([relay], npub, "test_table");
  //   console.log(table);

  //   const single = getTable([relay], npub, "key1");
  //   console.log(single);
});

test("GetTest", () => {
  const all = getAll([relay], npub, 10);
  console.log(all);

  const table = getTable([relay], npub, "test_table");
  console.log(table);

  const single = getSingle([relay], npub, "test_table", "key1");
  console.log(single);
});

test("UpsertTest", () => {
  const all = getAll([relay], npub, 10);
  console.log(all);

  const table = getTable([relay], npub, "test_table");
  console.log(table);

  const single = getTable([relay], npub, "key1");
  console.log(single);
});

test("ClearTest", () => {
  const all = getAll([relay], npub, 10);
  console.log(all);

  const table = getTable([relay], npub, "test_table");
  console.log(table);

  const single = getTable([relay], npub, "key1");
  console.log(single);
});
