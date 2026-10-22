import { useHydrated } from "@/lib/use-hydrated";
import { useState } from "react";
import { platformAdmin } from "@/lib/admin/api";
import { useI18n } from "@/lib/i18n";
import { btnGhost, btnPrimary, controlClass } from "./field";
import { ADMIN_COPY, ADMIN_RESOURCES, ADMIN_RESOURCE_NAMES } from "@/lib/admin/copy";
/** Authenticated operational editor. Closed server adapters validate every field and domain rule. */
export function PlatformAdmin() {
  const ready = useHydrated();
  const { lang } = useI18n();
  const t = ADMIN_COPY[lang];
  const names = ADMIN_RESOURCE_NAMES[lang];
  const [resource, setResource] = useState("products");
  const [editable, setEditable] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [key, setKey] = useState<Record<string, unknown>>({});
  const [draft, setDraft] = useState("{}");
  const [operation, setOperation] = useState("create");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [offset, setOffset] = useState(0);
  const [confirm, setConfirm] = useState(false);
  async function run(op: string, start = offset) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const data = op === "list" || op === "delete" ? undefined : JSON.parse(draft);
      const result = await platformAdmin({
        data: { resource, operation: op, key, data, offset: start },
      });
      if ("error" in result) {
        setMessage(`${t[11]} (${result.error})`);
        return;
      }
      const body = JSON.parse(result.result) as {
        rows?: Record<string, unknown>[];
        editable?: string[];
      };
      if (body.rows) {
        setRows(body.rows);
        setEditable(body.editable ?? []);
        setOffset(start);
      } else {
        setMessage(t[10]);
        setRows([]);
      }
    } catch {
      setMessage(t[11]);
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }
  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-2xl font-bold">{t[0]}</h2>
      <label className="flex flex-col gap-2 text-sm">
        {t[1]}
        <select
          className={controlClass}
          disabled={!ready}
          value={resource}
          onChange={(e) => {
            setResource(e.target.value);
            setRows([]);
            setKey({});
            setDraft("{}");
            setOffset(0);
            setConfirm(false);
            setMessage("");
          }}
        >
          {ADMIN_RESOURCES.map((r) => (
            <option key={r} value={r}>
              {names[r]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={btnGhost} disabled={busy || !ready} onClick={() => run("list", 0)}>
          {t[2]}
        </button>
        <button
          className={btnGhost}
          disabled={busy || !ready || offset === 0}
          onClick={() => run("list", Math.max(0, offset - 50))}
        >
          ← 50
        </button>
        <button
          className={btnGhost}
          disabled={busy || !ready || rows.length < 50}
          onClick={() => run("list", offset + 50)}
        >
          50 →
        </button>
        {resource !== "audit" && (
          <button
            className={btnGhost}
            onClick={() => {
              setKey({});
              setOperation("create");
              setDraft("{}");
            }}
          >
            {t[3]}
          </button>
        )}
      </div>
      <div className="flex max-h-96 min-w-0 flex-col gap-3 overflow-auto">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border border-line p-3">
            <pre dir="ltr" className="whitespace-pre-wrap break-all text-xs">
              {JSON.stringify(row, null, 2)}
            </pre>
            {resource !== "audit" && (
              <button
                className={btnGhost}
                disabled={!ready || busy}
                onClick={() => {
                  const keys =
                    resource === "roles"
                      ? ["user_id", "role"]
                      : resource === "settings"
                        ? ["key"]
                        : ["id"];
                  setKey(Object.fromEntries(keys.map((k) => [k, row[k]])));
                  setDraft(
                    JSON.stringify(
                      Object.fromEntries(
                        Object.entries(row).filter(
                          ([k]) => editable.includes(k) && !keys.includes(k),
                        ),
                      ),
                      null,
                      2,
                    ),
                  );
                  setOperation("update");
                }}
              >
                {t[4]}
              </button>
            )}
          </div>
        ))}
      </div>
      {resource !== "audit" && (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void run(operation);
          }}
        >
          <p className="break-all text-xs">
            {t[7]}: <bdi dir="ltr">{JSON.stringify(key)}</bdi>
          </p>
          <label className="flex flex-col gap-2 text-sm">
            {t[8]}
            <textarea
              className={controlClass}
              disabled={!ready}
              dir="ltr"
              rows={8}
              maxLength={12000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <button className={btnPrimary} disabled={busy || !ready}>
            {t[9]} · {operation === "create" ? t[3] : t[4]}
          </button>
          {Object.keys(key).length > 0 && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  disabled={!ready}
                  checked={confirm}
                  onChange={(e) => setConfirm(e.target.checked)}
                />
                {t[12]}
              </label>
              <button
                type="button"
                className={btnGhost}
                disabled={busy || !ready || !confirm}
                onClick={() => run("delete")}
              >
                {t[5]}
              </button>
            </>
          )}
        </form>
      )}
      <p role="status" className="break-words text-sm">
        {message}
      </p>
    </section>
  );
}
