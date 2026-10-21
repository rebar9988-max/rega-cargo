/**
 * Connects to a VERIFIED IP address over TLS using Cloudflare Workers TCP sockets, so the address
 * that safe-fetch.ts checked is the address that is used (no second DNS lookup, no rebinding).
 *
 * Fails closed: outside the Workers runtime (or if the platform refuses the connection, for
 * example to another Cloudflare-proxied site) it throws, and the import falls back to manual
 * entry. It never falls back to a plain `fetch()` of the user's URL.
 */
import type { Conn } from "./http1.ts";

type Sockets = {
  connect(
    address: { hostname: string; port: number },
    options: { secureTransport: "starttls"; allowHalfOpen: boolean },
  ): {
    startTls(options: { expectedServerHostname: string }): {
      readable: ReadableStream<Uint8Array>;
      writable: WritableStream<Uint8Array>;
      close(): Promise<void>;
    };
    close(): Promise<void>;
  };
};

export class TransportUnavailable extends Error {}

async function loadSockets(): Promise<Sockets> {
  try {
    // Specifier kept in a variable so bundlers do not try to resolve a Workers-only module.
    const specifier = "cloudflare:sockets";
    return (await import(/* @vite-ignore */ specifier)) as Sockets;
  } catch {
    throw new TransportUnavailable("sockets_unavailable");
  }
}

export async function connectVerifiedIp(ip: string, host: string): Promise<Conn> {
  const { connect } = await loadSockets();
  const plain = connect(
    { hostname: ip, port: 443 },
    { secureTransport: "starttls", allowHalfOpen: false },
  );
  const tls = plain.startTls({ expectedServerHostname: host });
  const reader = tls.readable.getReader();
  const writer = tls.writable.getWriter();
  return {
    async read() {
      const { value, done } = await reader.read();
      return done ? null : value;
    },
    async write(bytes) {
      await writer.write(bytes);
    },
    close() {
      void reader.cancel().catch(() => {});
      void writer.close().catch(() => {});
      void tls.close().catch(() => {});
    },
  };
}
