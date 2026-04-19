/**
 * Strip tags for short previews (cards, list excerpts). Not a full HTML parser.
 */
export function htmlToPlainText(html: string): string {
  if (!html) {
    return "";
  }
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Legacy plain-text descriptions become safe paragraphs; existing HTML is left as-is.
 */
export function toEditorHtml(raw: string): string {
  const t = raw.trim();
  if (!t) {
    return "<p></p>";
  }
  if (t.includes("<")) {
    return raw;
  }
  const escaped = t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const parts = escaped.split(/\n\n+/);
  const body = parts
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("");
  return body || "<p></p>";
}
