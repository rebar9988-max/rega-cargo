/**
 * Responsive variants for the bundled sample photos in `public/bazaar/`.
 *
 * The 1408px JPEG originals stay in place (market rows and the seller form
 * still reference `/bazaar/<name>.jpg`); browsers get 320/640px WebP copies
 * generated from them instead. Any other image URL is passed through as-is.
 */
export const BAZAAR_PHOTOS = [
  "baby",
  "ball",
  "cream",
  "dress",
  "earbuds",
  "kettle",
  "perfume",
  "sneakers",
] as const;

const BAZAAR_JPG = /^\/bazaar\/([a-z]+)\.jpg$/;

export type ResponsiveImage = { src: string; srcSet?: string; sizes?: string };

export function responsiveImage(src: string, sizes: string): ResponsiveImage {
  const name = BAZAAR_JPG.exec(src)?.[1];
  if (!name || !(BAZAAR_PHOTOS as readonly string[]).includes(name)) return { src };
  return {
    src: `/bazaar/${name}-640.webp`,
    srcSet: `/bazaar/${name}-320.webp 320w, /bazaar/${name}-640.webp 640w`,
    sizes,
  };
}
