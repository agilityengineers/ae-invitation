/**
 * Parse a YouTube/Vimeo URL (or bare id) into a background-video embed src —
 * autoplay, muted, looping, controls-off. Ported from vidSrc() in the engines.
 */
export function videoEmbedSrc(type: "youtube" | "vimeo" | string, url: string): string {
  url = (url || "").trim();
  if (!url) return "";
  if (type === "youtube") {
    const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{6,})/);
    const id = m ? m[1] : /^[\w-]{6,}$/.test(url) ? url : "";
    return id
      ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0`
      : "";
  }
  if (type === "vimeo") {
    const v = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/);
    const id = v ? v[1] : /^\d+$/.test(url) ? url : "";
    return id ? `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&loop=1` : "";
  }
  return "";
}
