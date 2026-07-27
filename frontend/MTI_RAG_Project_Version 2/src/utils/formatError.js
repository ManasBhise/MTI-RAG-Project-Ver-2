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
