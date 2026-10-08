/**
 * Server-side checks for uploaded photos. We never trust the declared MIME
 * type: the format is sniffed from magic bytes and the pixel size is read from
 * the file header, so oversized or non-image payloads are rejected before any
 * inference is paid for.
 */
export const MAX_IMAGE_BYTES = 1_500_000;
export const MAX_IMAGE_SIDE = 2048;
export const MIN_IMAGE_SIDE = 64;

export type ImageKind = "jpeg" | "png" | "webp";
export type ImageInfo = { kind: ImageKind; width: number; height: number; mime: string };
export type ImageCheck =
  | { ok: true; info: ImageInfo }
  | { ok: false; error: "too_large" | "unsupported" | "bad_dimensions" };

const MIME: Record<ImageKind, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function sniffKind(b: Uint8Array): ImageKind | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  )
    return "png";
  if (b.length >= 12 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 4) === "WEBP") return "webp";
  return null;
}

function ascii(b: Uint8Array, start: number, len: number) {
  return String.fromCharCode(...b.subarray(start, start + len));
}

function u16be(b: Uint8Array, i: number) {
  return (b[i] << 8) | b[i + 1];
}

function u32be(b: Uint8Array, i: number) {
  return ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3];
}

function u24le(b: Uint8Array, i: number) {
  return b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
}

export function readDimensions(
  b: Uint8Array,
  kind: ImageKind,
): { width: number; height: number } | null {
  if (kind === "png") {
    if (b.length < 24 || ascii(b, 12, 4) !== "IHDR") return null;
    return { width: u32be(b, 16), height: u32be(b, 20) };
  }
  if (kind === "webp") {
    const chunk = ascii(b, 12, 4);
    if (chunk === "VP8X" && b.length >= 30)
      return { width: u24le(b, 24) + 1, height: u24le(b, 27) + 1 };
    if (chunk === "VP8 " && b.length >= 30)
      return { width: (b[26] | (b[27] << 8)) & 0x3fff, height: (b[28] | (b[29] << 8)) & 0x3fff };
    if (chunk === "VP8L" && b.length >= 25) {
      const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  }
  // JPEG: walk segments until a start-of-frame marker.
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = u16be(b, i + 2);
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) return { height: u16be(b, i + 5), width: u16be(b, i + 7) };
    if (len < 2) return null;
    i += 2 + len;
  }
  return null;
}

export function checkImage(bytes: Uint8Array): ImageCheck {
  if (bytes.length > MAX_IMAGE_BYTES) return { ok: false, error: "too_large" };
  const kind = sniffKind(bytes);
  if (!kind) return { ok: false, error: "unsupported" };
  const dims = readDimensions(bytes, kind);
  if (!dims) return { ok: false, error: "unsupported" };
  const { width, height } = dims;
  if (
    width < MIN_IMAGE_SIDE ||
    height < MIN_IMAGE_SIDE ||
    width > MAX_IMAGE_SIDE ||
    height > MAX_IMAGE_SIDE
  ) {
    return { ok: false, error: "bad_dimensions" };
  }
  return { ok: true, info: { kind, width, height, mime: MIME[kind] } };
}
