import { eventKind, NostrFetcher } from "nostr-fetch";
const fetcher = NostrFetcher.init();

// types
export type KeyValueArray = string[][];
type DBHeadEntry = ["d", string] | ["title", string] | ["t", string];
type DBHead = DBHeadEntry[];

// local functions
const unixtime = () => Math.floor(new Date().getTime() / 1000);
function keyExists(array: KeyValueArray, key: string): boolean {
  return array.some((item) => item[0] === key);
}
function updateKeyValue(array: KeyValueArray, key: string, value: string) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][0] === key) {
      array[i][1] = value;
      break;
    }
  }
  return array;
}

// export funstions
export const getAll = async (
  relay: string[],
  author: string,
  limit?: number
) => {
  const result = await fetcher.fetchLatestEvents(
    relay,
    {
      kinds: [eventKind.appSpecificData],
      authors: [author],
    },
    limit ?? 100
  );
  return result;
};

export const getTable = async (
  relay: string[],
  author: string,
  tableName: string
) => {
  const result = await fetcher.fetchLastEvent(relay, {
    kinds: [eventKind.appSpecificData],
    "#d": [tableName],
    authors: [author],
  });
  return result;
};

export const getSingle = async (
  relay: string[],
  author: string,
  tableName: string,
  key: string
) => {
  const result = await fetcher.fetchLastEvent(relay, {
    kinds: [eventKind.appSpecificData],
    "#d": [tableName],
    authors: [author],
  });
  if (result) {
    let tag = result.tags.find((tag) => tag[0] === key);
    return tag ? tag[1] : null;
  }
  return null;
};

export const createTable = (tableName: string, tableTitle: string) => {
  const db_head: DBHead = [
    ["d", tableName],
    ["title", tableTitle],
    ["t", tableName],
  ];
  const ev = {
    kind: eventKind.appSpecificData,
    content: "test",
    tags: db_head,
    created_at: unixtime(),
  };
  return ev;
};

export const createTableExists = async (
  relay: string[],
  author: string,
  tableName: string,
  tableTitle: string
) => {
  const result = await getTable(relay, author, tableName);
  if (result) return null;
  const db_head: DBHead = [
    ["d", tableName],
    ["title", tableTitle],
    ["t", tableName],
  ];
  const ev = {
    kind: eventKind.appSpecificData,
    content: "test",
    tags: db_head,
    created_at: unixtime(),
  };
  return ev;
};

export const upsertTable = async (
  relay: string[],
  author: string,
  tableName: string,
  options: KeyValueArray,
  values: KeyValueArray
) => {
  const result = await fetcher.fetchLastEvent(relay, {
    kinds: [eventKind.appSpecificData],
    "#d": [tableName],
    authors: [author],
  });
  if (!result) return null;

  let tags = result.tags;
  options.forEach(([key, value]) => {
    if (keyExists(tags, key)) {
      tags = updateKeyValue(tags, key, value);
    } else {
      tags.push([key, value]);
    }
  });

  values.forEach(([key, value]) => {
    if (keyExists(tags, key)) {
      tags = updateKeyValue(tags, key, value);
    } else {
      tags.push([key, value]);
    }
  });

  const ev = {
    kind: result.kind,
    content: result.content,
    tags: tags,
    created_at: unixtime(),
  };

  return ev;
};

export const clearTable = async (
  relay: string[],
  author: string,
  tableName: string,
  optionsLength: number
) => {
  const result = await fetcher.fetchLastEvent(relay, {
    kinds: [eventKind.appSpecificData],
    "#d": [tableName],
    authors: [author],
  });
  if (!result) return null;
  const ev = {
    kind: result.kind,
    content: result.content,
    tags: result.tags.slice(0, 3 + optionsLength),
    created_at: unixtime(),
  };
  return ev;
};

type ValueType = string | number | object;
export type KeyValueObject = {
  [key: string]: ValueType;
};
export const utilKeyValueArrayToObject = (
  values: KeyValueArray
): KeyValueObject => {
  let result: KeyValueObject = {};

  for (let item of values) {
    let [key, value] = item;
    result[key] = value;
  }
  return result;
};

export const utilObjectToKeyValueArray = (
  values: KeyValueObject
): KeyValueArray => {
  let array: KeyValueArray = [];
  for (let key in values) {
    let value = values[key];
    if (typeof value === "number") {
      value = value.toString();
    } else if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    array.push([key, value]);
  }
  return array;
};
