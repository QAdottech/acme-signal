export const metadata = {
  title: "Bot test — docs",
};

/** Example page under /bot-test/ for crawler tests. */
export default function BotTestDocsPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8 font-sans text-sm">
      <h1 className="text-xl font-semibold">Bot-test docs</h1>
      <p className="text-muted-foreground">
        Dummy documentation page. QATechBot should not fetch this per{" "}
        <code>robots.txt</code>.
      </p>
      <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-xs">
        {`{
  "section": "bot-test",
  "page": "docs",
  "note": "example crawl target"
}`}
      </pre>
    </main>
  );
}
