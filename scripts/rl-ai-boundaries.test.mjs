import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import ts from "typescript";

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(`${dir}/${e.name}`)
      : /\.tsx?$/.test(e.name)
        ? [`${dir}/${e.name}`]
        : [],
  );
}
function imports(file) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const out = [];
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      out.push(node.moduleSpecifier.text);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        node.expression.getText(source) === "require")
    ) {
      assert.ok(
        node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0]),
        `computed imports forbidden: ${file}`,
      );
      out.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return out;
}

test("R&L AI only accesses explicit public contracts, never business internals or database", () => {
  const allowed = new Set([
    "src/lib/langs",
    "src/lib/i18n",
    "src/lib/ai/challenge",
    "src/lib/ai/identify.server",
    "src/lib/ai/usage",
    "src/lib/ai/schema",
    "src/lib/ai/gate-client",
    "src/lib/compliance/check",
  ]);
  const violations = [];
  for (const file of files("src/modules/rl-ai").filter((f) => !f.includes("/tests/"))) {
    for (const specifier of imports(file)) {
      if (!specifier.startsWith(".") && !specifier.startsWith("@/")) {
        if (!["react", "lucide-react", "zod"].includes(specifier))
          violations.push(`${file}: external ${specifier}`);
        continue;
      }
      const target = relative(
        process.cwd(),
        resolve(
          specifier.startsWith("@/") ? "src" : dirname(file),
          specifier.startsWith("@/") ? specifier.slice(2) : specifier,
        ),
      ).replace(/\.(?:tsx?|css)$/, "");
      if (target.startsWith("src/modules/rl-ai/")) continue;
      const contract =
        file.includes("/infrastructure/") &&
        ((file.endsWith("marketplace-client.ts") && target === "src/lib/market/assistant-contract.server") ||
          (file.endsWith("ai-gateway-adapter.ts") && target === "src/lib/ai/gate.server"));
      if (!allowed.has(target) && !contract) violations.push(`${file}: ${target}`);
    }
  }
  assert.deepEqual(violations, []);
});

test("business modules never depend on assistant implementation; no circular domain dependency", () => {
  for (const dir of [
    "src/lib/market",
    "src/lib/requests",
    "src/lib/orders",
    "src/lib/auth",
    "src/lib/phone",
  ]) {
    for (const file of files(dir))
      assert.ok(!imports(file).some((i) => /modules\/rl-ai/.test(i)), file);
  }
});

test("module invariants are present in both agent entry points and owner governance", () => {
  for (const file of [
    "AGENTS.md",
    "CLAUDE.md",
    "src/modules/rl-ai/AGENTS.md",
    "src/modules/rl-ai/README.md",
  ]) {
    const text = readFileSync(file, "utf8");
    assert.match(text, /R&L AI/);
    assert.match(text, /owner instruction/i);
    assert.match(text, /privacy/i);
  }
  assert.match(
    readFileSync(".github/CODEOWNERS", "utf8"),
    /\/src\/modules\/rl-ai\/ @rebar9988-max/,
  );
  const route = readFileSync("server/routes/api/ai/chat.ts", "utf8");
  assert.ok(!/lib\/(?:db|market\/handlers|requests\/handlers)/.test(route));
});
