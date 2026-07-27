/**
 * Safely format error messages returned from API calls.
 * FastAPI validation errors can return arrays or objects like [{ loc: [...], msg: "...", type: "..." }]
 * React throws Minified Error #31 if an object/array is rendered directly into JSX.
 */
export function formatErrorMessage(detail, fallback = "An unexpected error occurred.") {
  if (!detail) return fallback;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          return item.msg || item.message || JSON.stringify(item);
        }
        return String(item);
      })
      .join(", ");
  }

  if (typeof detail === "object" && detail !== null) {
    return detail.msg || detail.message || detail.detail || JSON.stringify(detail);
  }

  return String(detail);
}

/**
 * Robust client-side fallback translation to Hindi (Devanagari script)
 */
export async function translateToHindiClient(text) {
  if (!text) return "";
  try {
    const paragraphs = text.split("\n\n");
    const translatedParagraphs = await Promise.all(
      paragraphs.map(async (paragraph) => {
        if (!paragraph.trim()) return "";
        if (paragraph.startsWith("```")) return paragraph;

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=hi&dt=t&q=${encodeURIComponent(paragraph)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data[0]) {
          return data[0].map((chunk) => chunk[0]).filter(Boolean).join("");
        }
        return paragraph;
      })
    );
    return translatedParagraphs.join("\n\n");
  } catch (err) {
    console.error("Client Hindi translation error:", err);
    return null;
  }
}
