# Nostr-Key-Value

これは Nostr を Key-Value の DB として使用したいプロジェクトです。
JavaScript/TypeScript をサポートします。

-> [to English](./README.md)

このライブラリは NIP-78 が使用されています。 NIP-78 とは remoteStorage のようなものを提供するシステムです。kind: 30078 が設定された post のことで、NIP-33 (Kind: 3xxxx) を拡張しています。

-> [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md) -> [NIP-78 日本語訳](https://scrapbox.io/nostr/NIP-78)

## 作った人

- github: @ShinoharaTa (https://github.com/ShinoharaTa)
- nostr: shino3 (https://nostx.shino3.net/npub1l60d6h2uvdwa9yq0r7r2suhgrnsadcst6nsx2j03xwhxhu2cjyascejxe5)
- NIP-05: shino3@nostr.shino3.net
- LNaddr: achingcancer35@walletofsatoshi.com

## データ構成

このプロジェクトは以下のように KeyValue のストレージを作って使用されることを想定しています。  
value の中身は何を使用しても構いませんが、string であることが必須です。例えば JSON 形式のオブジェクトを設定することもできますが、その場合は string にエンコードされている必要があります。

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

## インストール

以下のコマンドでインストールできます：

```shell
npm install nostr-key-value
```

## 使用方法

プロジェクトに npm 経由で導入後、以下のコードで使用します。

```javascript
import {} from "nostr-key-value";
```

### GET

Nostr リレー上に保存された `kind: 30078` から指定したものを取得する処理です。

#### `getAll`

Author が持つ全ての `kind: 30078` を取得します。

- 引数
  - relay: `[wss://relay-url]` string 型の配列（必須）
  - author: `npub` string 型（必須）
  - limit: `取得最大件数` number 型、デフォルト: 100 件
- 戻り値
  - NostrEvent（nostr-fetch の NostrEvent 型）の配列
  - ※ 一致するものがない場合、レスポンスの array.length は 0 になります

#### `getTable`

Author が持つ `kind: 30078` からテーブル名が一致したオブジェクトを取得します。

- 引数
  - relay: `[wss://relay-url]` string 型の配列（必須）
  - author: `npub` string 型（必須）
  - table: string 型（必須）
- 戻り値
  - NostrEvent（nostr-fetch の NostrEvent 型）or Null
  - ※ 一致するものがない場合、レスポンスは null になります

#### `getSingle`

Author が持つ `kind: 30078` からテーブルを検索し、そのテーブルの指定したキーを取得します。

- 引数
  - relay: `[wss://relay-url]` string 型の配列（必須）
  - author: `npub` string 型（必須）
  - table: string 型（必須）
  - key: string 型（必須）
- 戻り値
  - string 型 or Null
  - ※ 一致するものがない場合、レスポンスは null になります

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

この関数はテーブル新規作成に必要な JSON を返します。  
JSON を署名し、リレーに送信した段階でテーブルの作成が完了します。

※ JSON は nostr-tools 等を使用して署名と投稿を行ってください。このライブラリではサポートされません
※ `注意` 既にリレー上に同一のテーブルが存在するときは、そのテーブルは上書きされます。

#### `createTable`

- 引数
  - tableName: string 型（必須）
  - tableTitle: string 型（必須）
- 戻り値
  - JSON オブジェクト

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

### INSERT, UPDATE

この関数はテーブルへのデータ追加・更新に必要な JSON を返します。  
JSON を署名し、リレーに送信した段階でテーブルの更新が完了します。

※ JSON は nostr-tools 等を使用して署名と投稿を行ってください。このライブラリではサポートされません
※ `注意` ロールバックはできません

#### `upsertTable`

- 引数
  - relay: `[wss://relay-url]` string 型の配列（必須）
  - author: `npub` string 型（必須）
  - tableName: string 型（必須）
  - options: KeyValueArray 型の配列（必須）、※ length: 0 OK
  - items: KeyValueArray 型の配列（必須）、※ length: 0 OK
- 戻り値
  - JSON オブジェクト or null
  - ※ 一致するテーブルがない場合、レスポンスは null になります

```javascript
import { upsertTable } from "nostr-key-value";

const options = [
  ["option_key0", "value"],
  ["option_key1", "value"],
  ["option_key2", "value"],
];
const datas = [
  ["data_key0", "value"],
  ["data_key1", "value"],
  ["data_key2", "value"],
  ["data_key3", "value"],
  ["data_key4", "value"],
];

const table_ev = upsertTable([relayUrl], npub, "table_name", options, items);
// use nostr tools posts;
post(table_ev);
```

### CLEAR

この関数はテーブルのデータをクリアする JSON を返します。  
JSON を署名し、リレーに送信した段階でテーブルの更新が完了します。

※ JSON は nostr-tools 等を使用して署名と投稿を行ってください。このライブラリではサポートされません
※ `注意` ロールバックはできません

#### `clearTable`

- 引数
  - relay: `[wss://relay-url]` string 型の配列（必須）
  - author: `npub` string 型（必須）
  - tableName: string 型（必須）
  - optionsLength: number 型（必須） ※ length: 0 OK
- 戻り値
  - JSON オブジェクト or null
  - ※ 一致するテーブルがない場合、レスポンスは null になります

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
