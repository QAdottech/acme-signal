import Link from "next/link";

export const metadata = {
  title: "Bot test area",
  description:
    "Example crawl targets under /bot-test. Disallowed for User-agent QATechBot in robots.txt.",
};

export default function BotTestIndexPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8 font-sans text-sm">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          /bot-test — crawl sandbox
        </h1>
        <p className="mt-2 text-muted-foreground">
          These URLs are listed in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            robots.txt
          </code>{" "}
          as <strong>Disallow</strong> for <code>QATechBot</code> (with{" "}
          <code>Crawl-delay: 2</code> for that bot).
        </p>
      </div>
      <ul className="list-inside list-disc space-y-2">
        <li>
          <Link href="/bot-test/docs" className="text-primary underline">
            /bot-test/docs
          </Link>{" "}
          — HTML page
        </li>
        <li>
          <Link href="/bot-test/items" className="text-primary underline">
            /bot-test/items
          </Link>{" "}
          — another HTML page
        </li>
        <li>
          <a
            href="/bot-test/static/sample.json"
            className="text-primary underline"
          >
            /bot-test/static/sample.json
          </a>{" "}
          — static JSON
        </li>
        <li>
          <a
            href="/bot-test/static/feed.xml"
            className="text-primary underline"
          >
            /bot-test/static/feed.xml
          </a>{" "}
          — static XML
        </li>
        <li>
          <a
            href="/bot-test/static/urls.txt"
            className="text-primary underline"
          >
            /bot-test/static/urls.txt
          </a>{" "}
          — plain URL list
        </li>
      </ul>
    </main>
  );
}
