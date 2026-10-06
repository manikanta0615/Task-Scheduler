import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Task Scheduler" },
      { name: "description", content: "Task Scheduler application" },
      { property: "og:title", content: "Task Scheduler" },
      { property: "og:description", content: "Task Scheduler application" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// Empty shell — awaiting requirements before building the Task Scheduler.
function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <h1 className="text-2xl font-semibold text-foreground">Task Scheduler</h1>
    </div>
  );
}
