import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Root route: send authenticated users to their tasks, everyone else to login.
export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect({ to: data.session ? "/tasks" : "/login" });
  },
  head: () => ({
    meta: [
      { title: "Task Scheduler" },
      { name: "description", content: "Task Scheduler — plan and manage your daily tasks." },
      { property: "og:title", content: "Task Scheduler" },
      { property: "og:description", content: "Plan and manage your daily tasks." },
    ],
  }),
  component: () => null,
});
