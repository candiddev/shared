/* eslint-disable @typescript-eslint/no-type-alias */

declare module "cordova-plugin-purchase";
declare module "moment-timezone/builds/moment-timezone-with-data-10-year-range";
declare module "mithril/test-utils/browserMock";
declare module "nosleep.js";
declare module "totp-generator";
declare module "whatwg-fetch";
declare module "xml2js";

declare module "*.png?format=webp" {
  const content: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default content;
}

declare module "*.svg" {
  const content: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default content;
}

declare module "Worker*" {
  export default Worker;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type NullCivilDate = string | null;
type NullCivilTime = string | null;
type NullUUID = string | null;
type NullTimestamp = string | null;

interface Tag {
  [key: string]: boolean | null | number | string | undefined;
  count: number;
  name: string;
}
