import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPublicIp,
  onlyPublicAddresses,
  parseImportUrl,
  parseIPv4,
  parseIPv6,
  parseRedirectTarget,
  safeImageUrl,
} from "./ssrf.ts";

const err = (raw: unknown) => {
  const r = parseImportUrl(raw);
  return r.ok ? "ok" : r.error;
};

describe("parseImportUrl", () => {
  it("accepts one plain https URL and drops the fragment", () => {
    const r = parseImportUrl("  https://www.Amazon.de/dp/B000123456?th=1#reviews ");
    assert.ok(r.ok);
    assert.equal(r.value.host, "www.amazon.de");
    assert.equal(r.value.url.hash, "");
  });

  it("refuses everything but https", () => {
    for (const u of [
      "http://amazon.de/x",
      "ftp://amazon.de/x",
      "file:///etc/passwd",
      "javascript:alert(1)",
      "data:text/html,x",
      "gopher://amazon.de",
    ]) {
      assert.notEqual(err(u), "ok", u);
    }
    assert.equal(err("http://amazon.de/x"), "scheme");
  });

  it("refuses more than one URL or pasted text", () => {
    assert.equal(err("https://a.com/x https://b.com/y"), "multiple");
    assert.equal(err("https://a.com/x\nhttps://b.com/y"), "multiple");
    assert.equal(err("look at this https://a.com/x"), "multiple");
    assert.equal(err("https://a.com/x\u0000"), "multiple");
  });

  it("refuses credentials and ports", () => {
    assert.equal(err("https://user:pw@amazon.de/x"), "credentials");
    assert.equal(err("https://user@amazon.de/x"), "credentials");
    assert.equal(err("https://amazon.de:8443/x"), "port");
    assert.equal(err("https://amazon.de:22/x"), "port");
  });

  it("refuses IP literals in every spelling", () => {
    for (const u of [
      "https://127.0.0.1/",
      "https://2130706433/", // decimal
      "https://0x7f000001/", // hex
      "https://0177.0.0.1/", // octal
      "https://127.1/",
      "https://169.254.169.254/latest/meta-data",
      "https://[::1]/",
      "https://[::ffff:127.0.0.1]/",
      "https://[2001:4860:4860::8888]/",
      "https://8.8.8.8/",
    ]) {
      assert.equal(err(u), "host", u);
    }
  });

  it("refuses internal and single-label names", () => {
    for (const h of [
      "localhost",
      "intranet",
      "metadata.google.internal",
      "printer.local",
      "foo.localhost",
      "router.lan",
      "a.home.arpa",
      "x.onion",
      "db.corp",
      "x.test",
    ]) {
      assert.equal(err(`https://${h}/`), "host", h);
    }
  });

  it("refuses non-strings, empty and oversized input", () => {
    for (const v of [undefined, null, 5, {}, [], "", "   "]) assert.equal(err(v), "url");
    assert.equal(err(`https://amazon.de/${"a".repeat(2000)}`), "url");
    assert.equal(err("not a url"), "multiple");
    assert.equal(err("notaurl"), "url");
  });

  it("an IDN host is accepted only in its punycode form", () => {
    const r = parseImportUrl("https://bücher.de/x");
    assert.ok(r.ok);
    assert.equal(r.value.host, "xn--bcher-kva.de");
  });
});

describe("parseRedirectTarget", () => {
  const base = new URL("https://shop.example.com/a");
  it("follows relative and absolute public targets", () => {
    const r = parseRedirectTarget(new URL("https://www.amazon.de/a"), "/dp/B000123456");
    assert.ok(r.ok);
    assert.equal(r.value.url.href, "https://www.amazon.de/dp/B000123456");
    assert.ok(parseRedirectTarget(base, "https://other-shop.com/x").ok);
  });
  it("applies the same rules to every hop", () => {
    for (const loc of [
      "http://amazon.de/x",
      "https://127.0.0.1/",
      "https://[::1]/",
      "https://amazon.de:444/x",
      "//169.254.169.254/",
      "file:///etc/passwd",
      "https://u:p@amazon.de/",
      "https://localhost/",
      "",
      "https://a.com/x https://b.com/",
    ]) {
      assert.equal(parseRedirectTarget(base, loc).ok, false, loc);
    }
  });
});

describe("isPublicIp (fail closed)", () => {
  it("allows ordinary public addresses", () => {
    for (const ip of [
      "8.8.8.8",
      "1.1.1.1",
      "93.184.216.34",
      "172.15.0.1",
      "172.32.0.1",
      "100.63.255.255",
      "100.128.0.1",
      "2606:4700:4700::1111",
      "2a00:1450:4001:81b::200e",
    ]) {
      assert.equal(isPublicIp(ip), true, ip);
    }
  });
  it("refuses private, loopback, link-local, metadata, CGNAT and reserved IPv4", () => {
    for (const ip of [
      "0.0.0.0",
      "0.1.2.3",
      "10.0.0.1",
      "10.255.255.255",
      "100.64.0.1",
      "100.127.255.255",
      "127.0.0.1",
      "127.255.255.254",
      "169.254.169.254",
      "172.16.0.1",
      "172.31.255.255",
      "192.0.0.1",
      "192.0.2.5",
      "192.88.99.1",
      "192.168.1.1",
      "198.18.0.1",
      "198.19.255.255",
      "198.51.100.1",
      "203.0.113.9",
      "224.0.0.1",
      "239.255.255.250",
      "240.0.0.1",
      "255.255.255.255",
    ]) {
      assert.equal(isPublicIp(ip), false, ip);
    }
  });
  it("refuses private, mapped, transition and special IPv6", () => {
    for (const ip of [
      "::",
      "::1",
      "::ffff:127.0.0.1",
      "::ffff:7f00:1",
      "::ffff:8.8.8.8",
      "::8.8.8.8",
      "64:ff9b::7f00:1",
      "64:ff9b::808:808",
      "fe80::1",
      "fec0::1",
      "fc00::1",
      "fd12:3456::1",
      "ff02::1",
      "2001::1",
      "2001:0:4136:e378:8000:63bf:3fff:fdd2",
      "2001:db8::1",
      "2002:7f00:1::1",
      "2002:808:808::1",
      "3fff::1",
      "100::1",
      "[::1]",
    ]) {
      assert.equal(isPublicIp(ip), false, ip);
    }
  });
  it("refuses anything it cannot parse", () => {
    for (const ip of [
      "",
      "abc",
      "1.2.3",
      "1.2.3.4.5",
      "256.1.1.1",
      "01.2.3.4",
      "1.2.3.04",
      "0x7f.0.0.1",
      "::g",
      "1::2::3",
      "fe80::1%eth0",
      "12345::1",
      "1.2.3.4/8",
      " 8.8.8.8",
      "8.8.8.8 ",
    ]) {
      assert.equal(isPublicIp(ip), false, JSON.stringify(ip));
    }
    assert.equal(isPublicIp(undefined as unknown as string), false);
  });
  it("parsers return exact bytes", () => {
    assert.deepEqual(parseIPv4("1.2.3.4"), [1, 2, 3, 4]);
    assert.deepEqual(parseIPv6("::1"), [...Array(15).fill(0), 1]);
    assert.deepEqual(parseIPv6("::ffff:1.2.3.4"), [...Array(10).fill(0), 255, 255, 1, 2, 3, 4]);
    assert.equal(parseIPv6("1:2:3:4:5:6:7:8:9"), null);
  });
});

describe("onlyPublicAddresses", () => {
  it("passes when every answer is public, de-duplicated", () => {
    assert.deepEqual(onlyPublicAddresses(["8.8.8.8", "8.8.8.8", "2606:4700:4700::1111"]), {
      ok: true,
      ips: ["8.8.8.8", "2606:4700:4700::1111"],
    });
  });
  it("refuses the whole host when ONE answer is private (rebinding trick)", () => {
    assert.deepEqual(onlyPublicAddresses(["8.8.8.8", "127.0.0.1"]), { ok: false });
    assert.deepEqual(onlyPublicAddresses(["93.184.216.34", "::1"]), { ok: false });
  });
  it("refuses an empty answer", () => assert.deepEqual(onlyPublicAddresses([]), { ok: false }));
});

describe("safeImageUrl", () => {
  it("keeps plain public https images and resolves relative ones", () => {
    assert.equal(
      safeImageUrl("https://m.media-amazon.com/images/I/a.jpg"),
      "https://m.media-amazon.com/images/I/a.jpg",
    );
    assert.equal(
      safeImageUrl("/img/a.jpg", new URL("https://www.zara.com/p/1")),
      "https://www.zara.com/img/a.jpg",
    );
  });
  it("drops unsafe image URLs", () => {
    for (const u of [
      "http://a.com/x.jpg",
      "data:image/png;base64,AAAA",
      "javascript:alert(1)",
      "https://127.0.0.1/x.png",
      "https://u:p@a.com/x.png",
      "https://a.com:8443/x.png",
      "https://a.com/x y.png",
      "https://localhost/x.png",
      "",
      5,
      null,
    ]) {
      assert.equal(safeImageUrl(u), null, String(u));
    }
  });
});
