/**
 * Turn an untrusted "return to" value (e.g. /login?from=…) into a same-site
 * path, or "/" if it could leave the site.
 *
 * String checks alone are not enough: browsers treat "\" like "/", strip
 * tabs and newlines, and resolve "//host" as another site. So the value is
 * resolved exactly as the browser would, and only kept when it stays on
 * the same origin.
 */
export function safeReturnPath(from: string | null | undefined, origin: string): string {
  if (!from || !from.startsWith("/")) return "/";
  // Backslashes and control characters are normalised by browsers into
  // something else entirely ("/\evil.com" becomes "//evil.com").
  // eslint-disable-next-line no-control-regex
  if (/[\\\u0000-\u001f\u007f]/.test(from)) return "/";
  try {
    const base = new URL(origin);
    const url = new URL(from, base);
    if (url.origin !== base.origin) return "/";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}
