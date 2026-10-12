/** Locked layout values. Changing any of these is a deliberate design change (update styles.css too). */
export const LAYOUT = {
  headerHeight: 64,
  headerRow: { phone: 64, tablet: 64, laptop: 88 },
  catalogueColumns: { phone: 2, tablet: 3, laptop: 3 },
  bottomBarHeight: 64,
  maxContent: 1200,
  gutter: { phone: 16, tablet: 24, laptop: 32 },
  cardColumns: { phone: 2, tablet: 3, laptop: 4 },
  minInputFont: 16,
} as const;

export type Bp = keyof typeof LAYOUT.gutter;

/**
 * Runs inside the page (must stay self-contained). Returns a list of human-readable
 * violations; an empty list means the layout matches the lock.
 */
export function measureLayout(args: { bp: Bp; layout: typeof LAYOUT; sheet: boolean }): string[] {
  const { bp, layout, sheet } = args;
  const out: string[] = [];
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const px = (n: number) => Math.round(n * 10) / 10;
  const visible = (el: Element) => {
    if (el.closest("[inert]")) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0)
      return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const describe = (el: Element) => {
    const id = el.id ? `#${el.id}` : "";
    const cls =
      typeof el.className === "string"
        ? `.${el.className.trim().split(/\s+/).slice(0, 4).join(".")}`
        : "";
    const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 30);
    return `<${el.tagName.toLowerCase()}${id}${cls}> "${text}"`;
  };

  // 1. Root tokens are the locked values.
  const root = getComputedStyle(document.documentElement);
  const token = (name: string) =>
    parseFloat(root.getPropertyValue(name)) *
    (root.getPropertyValue(name).includes("rem") ? 16 : 1);
  if (token("--header-h") !== layout.headerHeight)
    out.push(`--header-h is ${root.getPropertyValue("--header-h")}`);
  if (token("--bottom-bar-h") !== layout.bottomBarHeight)
    out.push(`--bottom-bar-h is ${root.getPropertyValue("--bottom-bar-h")}`);
  if (token("--layout-max") !== layout.maxContent)
    out.push(`--layout-max is ${root.getPropertyValue("--layout-max")}`);
  if (token("--gutter") !== layout.gutter[bp])
    out.push(
      `--gutter is ${root.getPropertyValue("--gutter")} (want ${layout.gutter[bp]}px at ${bp})`,
    );

  // 2. No horizontal overflow.
  const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  if (sw > vw + 1) out.push(`horizontal overflow: scrollWidth ${sw} > viewport ${vw}`);

  // 3. Header and bottom bar at their exact heights.
  const header = document.querySelector('[data-layout="header"]');
  if (!header || !visible(header)) out.push("header missing");
  else {
    const h = header.getBoundingClientRect().height;
    if (Math.abs(h - layout.headerRow[bp]) > 0.5)
      out.push(`header row ${px(h)} != ${layout.headerRow[bp]}`);
  }
  const bar = document.querySelector('[data-layout="bottom-bar"]');
  if (bp === "laptop") {
    if (bar && visible(bar)) out.push("bottom bar visible on laptop");
  } else if (!bar || !visible(bar)) out.push(`bottom bar missing on ${bp}`);
  else {
    const r = bar.getBoundingClientRect();
    if (Math.abs(r.height - layout.bottomBarHeight) > 0.5)
      out.push(`bottom bar height ${px(r.height)} != ${layout.bottomBarHeight}`);
    if (Math.abs(r.bottom - vh) > 1)
      out.push(`bottom bar not at viewport bottom (${px(r.bottom)} vs ${vh})`);
    if (Math.abs(r.width - vw) > 1) out.push(`bottom bar width ${px(r.width)} != ${vw}`);
  }

  // 4. Page containers: within max width, centred, fixed gutters.
  for (const el of document.querySelectorAll(".page")) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (r.width > layout.maxContent + 0.5)
      out.push(`page wider than max: ${px(r.width)} ${describe(el)}`);
    if (Math.abs(r.left - (vw - r.right)) > 1)
      out.push(`page not centred (${px(r.left)} / ${px(vw - r.right)}) ${describe(el)}`);
    const pl = parseFloat(cs.paddingLeft);
    const pr = parseFloat(cs.paddingRight);
    if (Math.abs(pl - layout.gutter[bp]) > 0.5 || Math.abs(pr - layout.gutter[bp]) > 0.5)
      out.push(`page gutter ${pl}/${pr} != ${layout.gutter[bp]} ${describe(el)}`);
  }

  // 5. Card grids: locked column count, equal widths/heights per row, fixed aspect media.
  for (const grid of document.querySelectorAll('[data-layout="card-grid"]')) {
    if (!visible(grid)) continue;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
    const expected =
      grid.getAttribute("data-layout-cols") === "catalogue"
        ? layout.catalogueColumns[bp]
        : layout.cardColumns[bp];
    if (cols !== expected)
      out.push(`card grid has ${cols} columns (want ${expected}) ${describe(grid)}`);
    const rows = new Map<number, DOMRect[]>();
    for (const child of grid.children) {
      if (!visible(child)) continue;
      const r = child.getBoundingClientRect();
      const key = Math.round(r.top);
      rows.set(key, [...(rows.get(key) ?? []), r]);
    }
    for (const [top, cells] of rows) {
      const ws = cells.map((c) => c.width);
      const hs = cells.map((c) => c.height);
      if (Math.max(...ws) - Math.min(...ws) > 1)
        out.push(`unequal card widths in row @${top}: ${ws.map(px).join(",")} ${describe(grid)}`);
      if (Math.max(...hs) - Math.min(...hs) > 1)
        out.push(`unequal card heights in row @${top}: ${hs.map(px).join(",")} ${describe(grid)}`);
    }
  }

  // 6. Nothing visibly outside the viewport (content clipped by a scroller/overflow box is fine).
  const clipRect = (el: Element) => {
    let left = -Infinity;
    let right = Infinity;
    for (
      let a = el.parentElement;
      a && a !== document.body && a !== document.documentElement;
      a = a.parentElement
    ) {
      const cs = getComputedStyle(a);
      if (cs.overflowX !== "visible" || cs.clipPath !== "none" || cs.contain.includes("paint")) {
        const r = a.getBoundingClientRect();
        left = Math.max(left, r.left);
        right = Math.min(right, r.right);
      }
    }
    return { left, right };
  };
  const outside: string[] = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.position === "absolute" && cs.clip !== "auto" && cs.clip !== "") continue; // sr-only
    const r = el.getBoundingClientRect();
    const c = clipRect(el);
    const left = Math.max(r.left, c.left);
    const right = Math.min(r.right, c.right);
    if (right - left <= 0) continue; // fully clipped
    if (left < -1 || right > vw + 1) outside.push(`${describe(el)} [${px(left)}..${px(right)}]`);
  }
  if (outside.length)
    out.push(`outside viewport (${outside.length}): ${outside.slice(0, 5).join(" | ")}`);

  // 7. Images: every content image sits in a box with a fixed aspect ratio, and renders at it.
  for (const img of document.querySelectorAll("img")) {
    if (!visible(img)) continue;
    const r = img.getBoundingClientRect();
    if (r.width < 64 || r.height < 64) continue; // icons/logos have fixed sizes
    let box: Element | null = img;
    for (let i = 0; box && i < 3 && getComputedStyle(box).aspectRatio === "auto"; i++)
      box = box.parentElement;
    const ratio = box ? getComputedStyle(box).aspectRatio : "auto";
    if (!box || ratio === "auto") {
      out.push(
        `image without fixed aspect ratio ${describe(img)} ${img.getAttribute("src")?.slice(0, 40)}`,
      );
      continue;
    }
    const [a, b] = ratio
      .replace("auto", "")
      .trim()
      .split("/")
      .map((s) => parseFloat(s));
    const want = b ? a / b : a;
    const br = box.getBoundingClientRect();
    if (Math.abs(br.width / br.height - want) / want > 0.01)
      out.push(`image box ratio ${px(br.width / br.height)} != ${ratio} ${describe(img)}`);
  }

  // 8. Inputs at >= 16px so iOS Safari never zooms on focus.
  for (const el of document.querySelectorAll("input, select, textarea")) {
    const type = el.getAttribute("type") ?? "";
    if (["checkbox", "radio", "range", "hidden", "file", "submit", "button"].includes(type))
      continue;
    if (!visible(el)) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < layout.minInputFont)
      out.push(`input font ${size}px < ${layout.minInputFont} ${describe(el)}`);
  }

  // 9. Type scale: every text run uses a size from the token scale active at this breakpoint.
  // One probe per step: reusing a single element can return a stale computed style.
  const probes = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"].map((step) => {
    const probe = document.createElement("span");
    probe.style.fontSize = `var(--text-${step})`;
    document.body.append(probe);
    return probe;
  });
  const allowed = new Set<number>(
    probes.map((probe) => px(parseFloat(getComputedStyle(probe).fontSize))),
  );
  for (const probe of probes) probe.remove();
  const srOnly = (el: Element) => {
    for (let a: Element | null = el; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.position === "absolute" && cs.clip !== "auto" && cs.clip !== "") return true;
    }
    return false;
  };
  const offScale = new Map<string, number>();
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest("svg, [data-layout-exempt]")) continue;
    const ownText = [...el.childNodes].some(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
    );
    if (!ownText || !visible(el) || srOnly(el)) continue;
    const size = px(parseFloat(getComputedStyle(el).fontSize));
    if (![...allowed].some((a) => Math.abs(a - size) <= 0.1)) {
      const chain: string[] = [];
      for (let a: Element | null = el.parentElement; a && chain.length < 4; a = a.parentElement)
        chain.push(`${a.tagName.toLowerCase()}=${getComputedStyle(a).fontSize}`);
      const key = `${size}px ${describe(el)} < ${chain.join(" < ")}`;
      offScale.set(key, (offScale.get(key) ?? 0) + 1);
    }
  }
  if (offScale.size)
    out.push(
      `off-scale font sizes (allowed ${[...allowed].join(",")}): ${[...offScale.keys()].slice(0, 6).join(" | ")}`,
    );

  if (sheet) {
    const s = document.querySelector('[data-layout="sheet"]');
    if (s && visible(s)) {
      const r = s.getBoundingClientRect();
      if (r.left < -1 || r.right > vw + 1)
        out.push(`sheet outside viewport ${px(r.left)}..${px(r.right)}`);
    }
  }
  return out;
}
