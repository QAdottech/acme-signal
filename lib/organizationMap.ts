export function getOrganizationMapUrls(location: string, apiKey?: string) {
  const query = location.trim();
  if (!query) return null;

  const searchUrl = new URL("https://www.google.com/maps/search/");
  searchUrl.searchParams.set("api", "1");
  searchUrl.searchParams.set("query", query);

  if (!apiKey?.trim()) return { searchUrl: searchUrl.toString() };

  const embedUrl = new URL("https://www.google.com/maps/embed/v1/place");
  embedUrl.searchParams.set("key", apiKey.trim());
  embedUrl.searchParams.set("q", query);

  return { searchUrl: searchUrl.toString(), embedUrl: embedUrl.toString() };
}
