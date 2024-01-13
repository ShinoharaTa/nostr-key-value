import { eventKind, NostrFetcher, NostrEventExt } from "nostr-fetch";
const fetcher = NostrFetcher.init();

export type NostrKeyValues = {
  [key: string]: string;
};

type Value = string | number | Date | null;

const unixtime = (): number => Math.floor(Date.now() / 1000);
const parseString = (item: Value): string => {
  if (typeof item === "string") {
    return item;
  } else if (typeof item === "number") {
    return item.toString();
  } else if (item instanceof Date) {
    return item.toISOString();
  } else {
    return "";
  }
};

function parseToObject(event: NostrEventExt<false> | undefined): any {
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
      kinds: [eventKind.appSpecificData],
      "#d": [this.appName],
      authors: [this.author],
    });
    return parseToObject(result);
  };

  getItem = async (key: string): Promise<string | null> => {
    const parsedContent = await this.getItems();
    if (!parsedContent) return null;
    return parsedContent.hasOwnProperty(key) ? parsedContent[key] : null;
  };

  setItem = async (key: string, value: Value) => {
    const result = await fetcher.fetchLastEvent(this.relays, {
      kinds: [eventKind.appSpecificData],
      "#d": [this.appName],
      authors: [this.author],
    });
    const keyValues = parseToObject(result) ?? {};
    keyValues[key] = parseString(value);
    const ev = {
      kind: eventKind.appSpecificData,
      content: JSON.stringify(keyValues),
      tags: [["d", this.appName]],
      created_at: unixtime(),
    };
    return ev;
  };

  dropItem = async (key: string) => {
    const keyValues = await this.getItems();
    if (!keyValues) return;
    if (!keyValues.hasOwnProperty(key)) return;
    delete keyValues[key];
    const ev = {
      kind: eventKind.appSpecificData,
      content: JSON.stringify(keyValues),
      tags: [["d", this.appName]],
      created_at: unixtime(),
    };
    return ev;
  };

  dropItems = async () => {
    const ev = {
      kind: eventKind.appSpecificData,
      content: JSON.stringify({}),
      tags: [["d", this.appName]],
      created_at: unixtime(),
    };
    return ev;
  };
}
