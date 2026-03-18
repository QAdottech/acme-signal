export const metadata = {
  title: "Bot test — items",
};

/** Example listing page under /bot-test/. */
export default function BotTestItemsPage() {
  const items = [
    { id: "a1", name: "Example item one" },
    { id: "b2", name: "Example item two" },
    { id: "c3", name: "Example item three" },
  ];

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8 font-sans text-sm">
      <h1 className="text-xl font-semibold">Bot-test items</h1>
      <p className="text-muted-foreground">
        Sample list content for crawlers that are allowed here; QATechBot is
        disallowed for all of <code>/bot-test/</code>.
      </p>
      <ul className="divide-y rounded-lg border">
        {items.map((item) => (
          <li key={item.id} className="px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground">
              {item.id}
            </span>{" "}
            — {item.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
