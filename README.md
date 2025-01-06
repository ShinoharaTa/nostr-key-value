# Nostr-Key-Value

NOTE: This README is translated by DeepL.

This is a project that wants to use Nostr as a Key-Value DB.
JavaScript/TypeScript support.

->[日本語のREADMEはこちら (to Japanese)](./README_jp.md)

This library uses NIP-78, which is a system that provides something like remoteStorage. NIP-78 is a system that provides something like remoteStorage; it is a post with Kind: 30078 and extends NIP-33 (Kind: 3xxxx).

-> [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md)

※ v0.3.x docs -> [./docs/v0.3/README.md](./docs/v0.3/README.md)

## Who made it

Shino3 (Shino-san) from:🇯🇵

- GitHub: @ShinoharaTa (https://github.com/ShinoharaTa)
- nostr: shino3 (https://nostx.io/_@shino3.net)
- NIP-05: _@shino3.net
- ⚡LN addr: shino3@walletofsatoshi.com

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

After installing via npm in your project, use the following code. Using initialize class.

```typescript
const npub = process.env.NPUB_HEX ?? "";
const relays = ["wss://nos.lol"];
const nostrKeyValue: NostrKeyValue = new NostrKeyValue(
  relays,
  npub,
  "nostr_key_value_update_test",
);

await nostrKeyValue.setItem("item", "Hello!");
const result_1 = await nostrKeyValue.getItem("item");
console.log("getValue: ", result_1);
// > Hello!
await nostrKeyValue.dropItem("item", );
const result_2 = await nostrKeyValue.getItem("item");
console.log("getValue: ", result_2);
// > null
```

### `getItem`

Searches a table from `kind: 30078` which Author has, and gets the specified key of the table.

- Arguments
  - key: string type (required)
- Return value
  - string type or Null
  - If no match is found, the response will be null.

### `setItem`

This function returns the JSON required to create a new table.  
The table creation is complete when the JSON is signed and submitted to the relay.

Please use nostr-tools or other tools to sign and submit the JSON. This library does not support it.
Note: If an identical table already exists on the relay, it will be overwritten.

- Arguments
  - key: string (required)
  - value: string | number | null (required)
- Return values
  - JSON object

example: `./tests/index.test.ts` see in create or update section.

### `dropItem`

This function deletes the specified key in the table.

Please use nostr-tools or other tools to sign and send JSON; this is not supported by this library.
`note` Please note that rollback is not available.

- Arguments
  - key: string (required)
- Return value
  - JSON object or null
  - If there is no matching table, the response will be null.

example: `./tests/index.test.ts` in drop section.
