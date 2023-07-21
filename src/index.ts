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
}

// export funstions
export const getAll = async (relay: string[], author: string, limit? :number) => {
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
  tableName: string,
  author: string
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
  tableName: string,
  author: string,
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

export const upsertTable = async (
  relay: string[],
  tableName: string,
  author: string,
  options: KeyValueArray,
  datas: KeyValueArray
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
      updateKeyValue(tags, key, value);
    } else {
      tags.push([key, value]);
    }
  });

  datas.forEach(([key, value]) => {
    if (keyExists(tags, key)) {
      updateKeyValue(tags, key, value);
    } else {
      tags.push([key, value]);
    }
  });

  const ev = {
    kind: result.kind,
    content: result.content,
    tags: result.tags,
    created_at: unixtime(),
  };

  return ev;
};

export const clearTable = async (
  relay: string[],
  tableName: string,
  author: string,
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
