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
        (file.includes("/ui/") && target === "src/lib/use-hydrated") ||
        (file.includes("/infrastructure/") &&
          ((file.endsWith("marketplace-client.ts") &&
            target === "src/lib/market/assistant-contract.server") ||
            (file.endsWith("ai-gateway-adapter.ts") && target === "src/lib/ai/gate.server")));
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

test("owner-only baseline rule is identical and retains governance review coverage", () => {
  const marker = "## OWNER-ONLY R&L AI BASELINE — 2026-10-14";
  const rules = [
    "AGENTS.md",
    "CLAUDE.md",
    "src/modules/rl-ai/AGENTS.md",
    "src/modules/rl-ai/README.md",
  ].map((file) => {
    const text = readFileSync(file, "utf8");
    assert.equal(text.split(marker).length, 2, `${file}: missing/duplicate owner rule`);
    return text.split(marker)[1].split(/\n## /)[0].trim();
  });
  for (const rule of rules) {
    assert.equal(rule, rules[0]);
    assert.ok(
      rule.includes(
        "Only a new explicit owner instruction specifically requesting the affected R&L AI change",
      ),
    );
    assert.ok(
      rule.includes(
        "A general request to redesign, modernize, refactor or upgrade R&L does not authorize",
      ),
    );
    assert.ok(
      rule.includes("Never remove or weaken these rules, their tests or owner-review coverage"),
    );
  }
  const owners = readFileSync(".github/CODEOWNERS", "utf8").split("\n");
  for (const file of ["AGENTS.md", "CLAUDE.md", "PROJECT_MEMORY.md", ".github/CODEOWNERS"])
    assert.ok(owners.includes(`/${file} @rebar9988-max`), file);
});

test("owner-approved AI identity, tools and Sorani customer baseline cannot drift silently", async () => {
  // Independent acceptance values, not snapshots regenerated from the implementation.
  // Change these only with a new explicit owner instruction recorded in project memory.
  async function load(file) {
    const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext },
    });
    return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
  }
  const policy = await load("src/modules/rl-ai/domain/scope-policy.ts");
  assert.equal(policy.RL_AI_IDENTITY, "R&L AI — یاریدەدەری زیرەکی کڕیار");
  assert.deepEqual(policy.RL_AI_TOOLS, [
    "marketplace.read",
    "bring.navigate",
    "delivery.navigate",
    "tracking.navigate",
    "support.navigate",
    "image.identify",
  ]);
  const { CHAT_COPY } = await load("src/modules/rl-ai/ui/assistant-copy.ts");
  assert.equal(CHAT_COPY.ckb.subtitle, "یاریدەدەری زیرەکی کڕیار");
  assert.equal(CHAT_COPY.ckb.start, "گفتوگۆ لەگەڵ R&L AI");
  assert.equal(
    CHAT_COPY.ckb.intro,
    "بەخێربێیت بۆ R&L AI. دەتوانم لە دۆزینەوەی کاڵا، داواکردن و گەیاندن یارمەتیت بدەم.",
  );
  assert.equal(
    CHAT_COPY.ckb.refusal,
    "ببورە، من تەنها بۆ یارمەتیدانت لە خزمەتگوزارییەکانی R&L دامەزراوم. دەتوانم لە بازاڕ، داواکردنی کاڵا و گەیاندن یارمەتیت بدەم.",
  );
  assert.deepEqual(
    ["shop", "compare", "bring", "track", "how"].map((key) => CHAT_COPY.ckb[key]),
    [
      "کاڵایەکم بۆ بدۆزەوە",
      "بەراوردی دوو کاڵام بۆ بکە",
      "کاڵام بۆ بهێنەوە",
      "داواکارییەکەم لە کوێیە؟",
      "چۆن کاڵا داوا بکەم؟",
    ],
  );
});
