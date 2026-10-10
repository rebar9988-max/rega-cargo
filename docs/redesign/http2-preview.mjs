// Local performance review only. Forward the built Wrangler app without changing its assets.
import { createSecureServer } from "node:http2";
import { request } from "node:http";
import { readFileSync } from "node:fs";

const [keyPath, certPath] = process.argv.slice(2);
if (!keyPath || !certPath) throw new Error("Usage: node docs/redesign/http2-preview.mjs KEY CERT");

createSecureServer(
  { key: readFileSync(keyPath), cert: readFileSync(certPath), allowHTTP1: true },
  (req, res) => {
    const headers = { ...req.headers, host: "localhost:8788" };
    for (const name of Object.keys(headers)) if (name.startsWith(":")) delete headers[name];
    const upstream = request(
      { hostname: "localhost", port: 8788, path: req.url, method: req.method, headers },
      (response) => {
        const outgoing = { ...response.headers };
        for (const name of ["connection", "transfer-encoding", "keep-alive", "upgrade"])
          delete outgoing[name];
        res.writeHead(response.statusCode, outgoing);
        response.pipe(res);
      },
    );
    upstream.on("error", () => {
      if (!res.headersSent) res.writeHead(502);
      res.end();
    });
    req.on("aborted", () => upstream.destroy());
    req.pipe(upstream);
  },
).listen(9443, "127.0.0.1", () => {
  console.log("Local HTTP/2 preview: https://localhost:9443/ → compiled Worker on port 8788");
});
