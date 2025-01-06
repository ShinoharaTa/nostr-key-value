import { type NostrEventExt, NostrFetcher } from "nostr-fetch";
import { kinds } from "nostr-tools";
import WebSocket from "ws";

const fetcher = NostrFetcher.init({ webSocketConstructor: WebSocket });

export type NostrKeyValues = {
  [key: string]: string;
};

type Value = string | number | Date | null;

const unixtime = (): number => Math.floor(Date.now() / 1000);
const parseString = (item: Value): string => {
  if (typeof item === "string") {
    return item;
  }
  if (typeof item === "number") {
    return item.toString();
  }
  if (item instanceof Date) {
    return item.toISOString();
  }
  return "";
};

function parseToObject(
  event: NostrEventExt<false> | undefined,
): NostrKeyValues | null {
  try {
    return event && typeof event.content === "string"
      ? JSON.parse(event.content)
      : null;
  } catch (e) {
    return null;
  }
}

export default class NostrKeyValue {
  private relays: string[] = [];
  private author: string;
  private appName: string;

  constructor(relays: string[], author: string, appName: string) {
    this.relays = relays;
    this.author = author;
    this.appName = appName;
  }

  getItems = async (): Promise<NostrKeyValues | null> => {
    const result = await fetcher.fetchLastEvent(this.relays, {
      kinds: [kinds.Application],
      "#d": [this.appName],
      authors: [this.author],
    });
    return parseToObject(result);
  };

  getItem = async (key: string): Promise<string | null> => {
    const parsedContent = await this.getItems();
    if (!parsedContent) return null;
    return key in parsedContent ? parsedContent[key] : null;
  };

  setItem = async (key: string, value: Value) => {
    const result = await fetcher.fetchLastEvent(this.relays, {
      kinds: [kinds.Application],
      "#d": [this.appName],
      authors: [this.author],
    });
    const keyValues = parseToObject(result) ?? {};
    keyValues[key] = parseString(value);
    const ev = {
      kind: kinds.Application,
      content: JSON.stringify(keyValues),
      tags: [["d", this.appName]],
      created_at: unixtime(),
    };
    return ev;
  };

  dropItem = async (key: string) => {
    const keyValues = await this.getItems();
    if (!keyValues) return null;
    if (!(key in keyValues)) return null;
    delete keyValues[key];
    const ev = {
      kind: kinds.Application,
      content: JSON.stringify(keyValues),
      tags: [["d", this.appName]],
      created_at: unixtime(),
    };
    return ev;
  };

  dropItems = async () => {
    const ev = {
      kind: kinds.Application,
      content: JSON.stringify({}),
      tags: [["d", this.appName]],
      created_at: unixtime(),
    };
    return ev;
  };
}
