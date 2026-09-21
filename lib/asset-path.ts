/**
 * GitHub Pages serves this as a project site under /<repo>, and a raw
 * `<img src="/...">` is not rewritten by Next the way a route is. Anything
 * loaded straight from /public has to be prefixed by hand.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const assetPath = (path: string) => `${BASE_PATH}${path}`;
