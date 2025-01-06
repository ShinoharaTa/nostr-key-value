# Nostr-Key-Value

これは Nostr を Key-Value の DB として使用したいプロジェクトです。
JavaScript/TypeScript をサポートします。

-> [to English](./README.md)

このライブラリは NIP-78 が使用されています。 NIP-78 とは remoteStorage のようなものを提供するシステムです。kind: 30078 が設定された post のことで、NIP-33 (Kind: 3xxxx) を拡張しています。

-> [NIP-78](https://github.com/nostr-protocol/nips/blob/master/78.md)  
-> [NIP-78 日本語訳](https://scrapbox.io/nostr/NIP-78)

※ v0.3.x docs -> [./docs/v0.3/README_JP.md](./docs/v0.3/README_JP.md)

## 作った人

Shino3 (しのさん)

- GitHub: @ShinoharaTa (https://github.com/ShinoharaTa)
- nostr: shino3 (https://nostx.io/_@shino3.net)
- NIP-05: _@shino3.net
- ⚡LN addr: achingcancer35@walletofsatoshi.com

## ライセンス

このライブラリには MIT が適用されます。

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

プロジェクトに npm 経由で導入後、以下のコードで使用します。クラスの初期化が必要です。

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

Nostr リレー上に保存された `kind: 30078` から指定したものを取得する処理です。

- 引数
  - key: string 型（必須）
- 戻り値
  - string 型 or Null
  - ※ 一致するものがない場合、レスポンスは null になります

### `setItem`

この関数はテーブル新規作成に必要な JSON を返します。  
JSON を署名し、リレーに送信した段階でテーブルの作成が完了します。

※ JSON は nostr-tools 等を使用して署名と投稿を行ってください。このライブラリではサポートされません
※ `注意` 既にリレー上に同一のテーブルが存在するときは、そのテーブルは上書きされます。

#### `createTable`

- 引数
  - key: string 型（必須）
  - value: string | number | null 型（必須）
- 戻り値
  - JSON オブジェクト

例: `./tests/index.test.ts` のcreateまたはupdateセクションを見てください。

### `dropItem`

この関数はテーブルの指定のキーを削除します。

※ JSON は nostr-tools 等を使用して署名と投稿を行ってください。このライブラリではサポートされません
※ `注意` ロールバックはできません

#### `clearTable`

- 引数
  - key: string 型（必須）
- 戻り値
  - JSON オブジェクト or null
  - ※ 一致するテーブルがない場合、レスポンスは null になります

例: `./tests/index.test.ts` のdropセクションを見てください。
