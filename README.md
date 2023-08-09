# Nostr-Key-Value

NOTE: This README is translated by DeepL.

This is a project that wants to use Nostr as a Key-Value DB.
JavaScript/TypeScript support.

->[日本語のREADMEはこちら (to Japanese)](./README_jp.md)

This library uses NIP-78, which is a system that provides something like remoteStorage. NIP-78 is a system that provides something like remoteStorage; it is a post with Kind: 30078 and extends NIP-33 (Kind: 3xxxx).

-> [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md)

## Who made it

Shino3 (Shino-san) from:🇯🇵

- GitHub: @ShinoharaTa (https://github.com/ShinoharaTa)
- nostr: shino3 (https://nostx.shino3.net/npub1l60d6h2uvdwa9yq0r7r2suhgrnsadcst6nsx2j03xwhxhu2cjyascejxe5)
- NIP-05: shino3@nostr.shino3.net
- ⚡LN addr: achingcancer35@walletofsatoshi.com

## License

MIT applies to this library.

## Data configuration

This project is intended to be used to create KeyValue storage as follows.  
The content of the value can be anything, but it must be a string. For example, you can set up a JSON-format object, but it must be encoded as a string.

- Author:
  - Table 1
    - Key: value
    - Key: value
    - Key: value
  - Table 2
    - Key: value
    - Key: value
    - Key: value
  - Table 3
    - Key: value
    - Key: value
    - Key: value

## Installation

You can install it with the following command:

```shell
npm install nostr-key-value
```

## How to use

After installing via npm in your project, use the following code.

### GET

GET the specified object from the `kind: 30078` stored on the Nostr relay.

#### `getAll`

Get all `kind: 30078` that Author has.

- Arguments
  - relay: `[wss://relay-url]` string array (required)
  - author: `npub` string (required)
  - limit: `maximum number to retrieve` of type number, default: 100
- Return value
  - Array of NostrEvent (NostrEvent type of nostr-fetch)
  - If no match is found, array.length in the response will be 0.

#### `getTable`

Get the object whose table name matches from `kind: 30078` which Author has.

- Arguments
  - relay: `[wss://relay-url]` string array (required)
  - author: `npub` string type (required)
  - table: string type (required)
- Return values
  - NostrEvent (NostrEvent type of nostr-fetch) or Null
  - If no match is found, the response will be null.

#### `getSingle`

Searches a table from `kind: 30078` which Author has, and gets the specified key of the table.

- Arguments
  - relay: `[wss://relay-url]` string array (required)
  - author: `npub` string type (required)
  - table: string type (required)
  - key: string type (required)
- Return value
  - string type or Null
  - If no match is found, the response will be null.

```javascript
import { getAll, getTable, getSingle } from "nostr-key-value";

async () => {
  const all = await getAll([relayUrl], npub, 10);
  console.log(all);

  const table = await getTable([relayUrl], npub, "test_table");
  console.log("table", table);

  const single = await getSingle([relayUrl], npub, "test_table", "key1");
  console.log("single", single);
};
```

### CREATE

This function returns the JSON required to create a new table.  
The table creation is complete when the JSON is signed and submitted to the relay.

Please use nostr-tools or other tools to sign and submit the JSON. This library does not support it.
Note: If an identical table already exists on the relay, it will be overwritten.

#### `createTable`

- Arguments
  - tableName: string (required)
  - tableTitle: string (required)
- Return values
  - JSON object

```javascript
import { createTable } from "nostr-key-value";

const table_ev = createTable("table_name", "table_title");
post(table_ev);

// use: nostr-tools methods
const relayUrl = "wss://your-relay-url";
const relay = relayInit(relayUrl);
const post = async (ev) => {
  return new Promise((resolve, reject) => {
    const data = finishEvent(ev, nsec);
    const pub = relay.publish(data);
    pub.on("ok", () => {
      resolve("success");
    });
    pub.on("failed", () => {
      reject("failed");
    });
  });
};
```

#### `createTableExists`

Checks for the existence of a table before creating it. Returns `null` if the table already exists.
If null, new creation of the table is protected.

- Arguments
  - relay: `[wss://relay-url]` string array (required)
  - author: `npub` string type (required)
  - tableName: string type (required)
  - tableTitle: string type (required)
- Return values
  - JSON object or null

```javascript
import { createTable } from "nostr-key-value";

const table_ev = createTableExists(
  [relayUrl],
  npub,
  "table_name",
  "table_title"
);
// use: nostr-tools post methods.
if(table_ev) post(table_ev);
```

### INSERT, UPDATE

This function returns the JSON required to add or update data to a table.  
The table update is complete when the JSON is signed and sent to the relay.

JSON should be signed and submitted using nostr-tools or similar. This is not supported by this library.
Note that `note` rollback is not available.

#### `upsertTable`

- Arguments
  - relay: `[wss://relay-url]` string array (required)
  - author: `npub` string type (required)
  - tableName: string type (required)
  - options: array of type KeyValueArray (required), * length: 0 OK
  - values: Array of the KeyValueArray type (required), * length: 0 OK
- Return value
  - JSON object or null
  - If there is no matching table, the response will be null.

```javascript
import { upsertTable } from "nostr-key-value";

const options = [
  ["option_key0", "value"],
  ["option_key1", "value"],
  ["option_key2", "value"],
];
const values = [
  ["data_key0", "value"],
  ["data_key1", "value"],
  ["data_key2", "value"],
  ["data_key3", "value"],
  ["data_key4", "value"],
];

const table_ev = upsertTable([relayUrl], npub, "table_name", options, values);
// use nostr tools posts;
post(table_ev);
```

#### `upsertTableOrCreate`

If the tables do not match, a new one is created and records are inserted.

- Arguments
  - relay: `[wss://relay-url]` string array (required)
  - author: `npub` string type (required)
  - tableName: string type (required)
  - tableTitle: string type (required)
  - options: array of type KeyValueArray (required), * length: 0 OK
  - values: Array of the KeyValueArray type (required), * length: 0 OK
- Return value
  - JSON object

```javascript
import { upsertTable } from "nostr-key-value";

const options = [
  ["option_key0", "value"],
  ["option_key1", "value"],
  ["option_key2", "value"],
];
const values = [
  ["data_key0", "value"],
  ["data_key1", "value"],
  ["data_key2", "value"],
  ["data_key3", "value"],
  ["data_key4", "value"],
];

const table_ev = upsertTableOrCreate(
  [relayUrl],
  npub,
  "table_name",
  "table_title",
  options,
  values
);
// use nostr tools posts;
post(table_ev);
```

### CLEAR

This function returns JSON to clear the data in the table.  
The table update is complete when the JSON is signed and sent to the relay.

Please use nostr-tools or other tools to sign and submit the JSON. This is not supported by this library.
Note that `note` rollback is not available.

#### `clearTable`

- Arguments
  - relay: `[wss://relay-url]` string array (required)
  - author: `npub` string type (required)
  - tableName: string type (required)
  - optionsLength: number type (required) * length: 0 OK
- Return value
  - JSON object or null
  - If there is no matching table, the response will be null.

```javascript
import { upsertTable } from "nostr-key-value";

const options = [
  ["option_key0", "value"],
  ["option_key1", "value"],
  ["option_key2", "value"],
];
const table_ev = upsertTable([relayUrl], npub, "table_name", options.length);
// use nostr tools posts;
post(table_ev);
```

### ユーティリティ

Useful items are provided. The following functions are provided

#### `utilKeyValueArrayToObject`

- Arguments
  - values: Array of KeyValueArray type (required), * length: 0 OK
- Return value
  - JSON object

```javascript
import { utilKeyValueArrayToObject } from "nostr-key-value";
const values = [
  ["data_key0", "value"],
  ["data_key1", "value"],
  ["data_key2", "value"],
  ["data_key3", "value"],
  ["data_key4", "value"],
];
const objects = utilKeyValueArrayToObject(values);
```

#### `utilObjectToKeyValueArray`

- Arguments
  - KeyValueObject: JSON object
- Return value
  - Array of KeyValueArray type (required), * length: 0 OK

```javascript
import { utilObjectToKeyValueArray } from "nostr-key-value";
const object = {
  data_key0: "value",
  data_key1: "value",
  data_key2: "value",
  data_key3: "value",
  data_key4: "value",
};
const values = utilObjectToKeyValueArray(values);
```
