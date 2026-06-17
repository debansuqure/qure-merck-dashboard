import { supabase } from "@/lib/supabase";
import type { Action, Programme, Site } from "@/lib/types";
import ActionsClient from "./ActionsClient";

export const revalidate = 0;

export default async function ActionsPage() {
  const [actionsRes, programmesRes, sitesRes] = await Promise.all([
    supabase
      .from("actions")
      .select("*, programme:programmes(*), site:sites(identifier)")
      .order("created_at", { ascending: false }),
    supabase.from("programmes").select("*").order("name"),
    supabase.from("sites").select("id, identifier").order("identifier"),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Action Tracker</h1>
        <p className="text-sm text-gray-500 mt-0.5">All open and completed actions</p>
      </div>
      <ActionsClient
        actions={(actionsRes.data ?? []) as Action[]}
        programmes={(programmesRes.data ?? []) as Programme[]}
        sites={(sitesRes.data ?? []) as Pick<Site, "id" | "identifier">[]}
        isAdmin={false}
      />
    </div>
  );
}
