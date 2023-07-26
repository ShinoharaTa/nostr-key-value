# Nostr-Key-Value

これは Nostr を Key-Value の DB として使用したいプロジェクトです。
JavaScript/TypeScriptをサポートします。

-> [to English](./README.md)

このライブラリは NIP-78 が使用されています。 NIP-78 とはremoteStorageのようなものを提供するシステムです。kind: 30078 が設定された post のことで、NIP-33 (Kind: 3xxxx) を拡張しています。

-> [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md) -> [NIP-78 日本語訳](https://scrapbox.io/nostr/NIP-78)

## データ構成

このプロジェクトは以下の用にKeyValueのストレージを作って使用されることを想定しています。  
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
import {} from "nostr-key-value"
```

### GET

一番ベーシックなもので、GETコマンドです。

- getAll
  - Author を指定し、kind: 30078 に紐づくすべてを配列で取得します。
  - レスポンスが一つもない場合、空の配列が返されます

- getTable
  - Author, Table を指定し、kind: 30078 に紐づく該当のテーブル名が設定されたオブジェクトを取得します。
  - レスポンスがない場合は null が返されます。

- getSingle
  - Author, Table, Key を指定し、kind: 30078 に紐づく該当のテーブル名から特定のキーを取得します。
  - レスポンスがない場合は null が返されます。

```javascript
import {getAll, getTable, getSingle} from "nostr-key-value"

async () => {
    const all = await getAll([relayUrl], npub, 10);
    console.log(all);

    const table = await getTable([relayUrl], npub, "test_table");
    console.log("table", table);

    const single = await getSingle([relayUrl], npub, "test_table", "key1");
    console.log("single", single);
}

```

### CREATE

テーブルを新規作成します。
この関数はテーブル作成に必要なオブジェクトを返します。

実際に作成されたテーブルを relay に送信するためには nostr-tools を使用します。

※ Nostr Tools の使い方は Nostr-tools の Document を読んでください

- createTable
  - テーブル名、テーブルのタイトルを設定します。
  - Author は Nostr-tools 経由で post するときに設定されます

レスポンスのオブジェクトを Nostr Tools 経由で Post すると、値が何も入っていないテーブルが出来上がります。

既にテーブルが存在する場合、そのテーブルは上書きされ、データが参照不可になります。使用の際は気をつけてください。

```javascript
import { createTable } from "nostr-key-value";

const table_ev = createTable("table_name", "table_title");post(table_ev);

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
