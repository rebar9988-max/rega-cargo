import { createIsomorphicFn } from "@tanstack/react-start";
import { readService, serviceFromCookieHeader, type Service } from "./service-choice";

/** Server: the request cookie. Client navigation: local storage. No network round-trip. */
export const initialService = createIsomorphicFn()
  .server(async (): Promise<Service> => {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    return serviceFromCookieHeader(getRequestHeader("cookie"));
  })
  .client(async (): Promise<Service> => readService());
