import { supabase } from "@/lib/supabase";
import type { Site, Milestone, Programme } from "@/lib/types";
import SitesClient from "./SitesClient";

export const revalidate = 0;

export default async function SitesPage() {
  const { data: programmes } = await supabase.from("programmes").select("*").order("name");
  const { data: sites } = await supabase
    .from("sites")
    .select("*, milestones(*), programme:programmes(*)")
    .order("identifier");

  const typedSites = (sites ?? []) as (Site & { milestones: Milestone[]; programme: Programme })[];
  const typedProgrammes = (programmes ?? []) as Programme[];

  // Group by programme
  const grouped = typedProgrammes.map((prog) => ({
    programme: prog,
    sites: typedSites.filter((s) => s.programme_id === prog.id),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Site Tracker</h1>
        <p className="text-sm text-gray-500 mt-0.5">All sites grouped by programme</p>
      </div>
      <SitesClient grouped={grouped} />
    </div>
  );
}
