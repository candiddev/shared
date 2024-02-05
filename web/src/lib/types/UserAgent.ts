export type UserAgent = string; // eslint-disable-line @typescript-eslint/no-type-alias

export const UserAgentUnknown: UserAgent = "unknown";
export const UserAgentAPI: UserAgent = "api";
export const UserAgentChrome: UserAgent = "chrome";
export const UserAgentEdge: UserAgent = "edge";
export const UserAgentFirefox: UserAgent = "firefox";
export const UserAgentSafari: UserAgent = "safari";

export function getUserAgent(): UserAgent {
  if (navigator.userAgent.includes("Edg")) {
    return UserAgentEdge;
  } else if (navigator.userAgent.includes("Chrome")) {
    return UserAgentChrome;
  } else if (navigator.userAgent.includes("Firefox")) {
    return UserAgentFirefox;
  } else if (navigator.userAgent.includes("Safari")) {
    return UserAgentSafari;
  }

  return UserAgentUnknown;
}
