import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Site, Milestone, Action, Risk, Programme } from "@/lib/types";
import AdminClient from "./AdminClient";

export const revalidate = 0;

export default async function AdminPage() {
  if (!isAuthenticated()) redirect("/admin/login");

  const [sitesRes, actionsRes, risksRes, programmesRes] = await Promise.all([
    supabase.from("sites").select("*").order("identifier"),
    supabase
      .from("actions")
      .select("*, programme:programmes(*), site:sites(identifier)")
      .order("created_at", { ascending: false }),
    supabase
      .from("risks")
      .select("*, programme:programmes(*)")
      .order("created_at", { ascending: false }),
    supabase.from("programmes").select("*").order("name"),
  ]);

  // DEBUG LOGGING
  console.log("sites error", sitesRes.error);
  console.log("actions error", actionsRes.error);
  console.log("risks error", risksRes.error);
  console.log("programmes error", programmesRes.error);

  console.log("sites rows", sitesRes.data?.length);
  console.log("actions rows", actionsRes.data?.length);
  console.log("risks rows", risksRes.data?.length);
  console.log("programmes rows", programmesRes.data?.length);

  const sites = (sitesRes.data ?? []) as (Site & {
    milestones: Milestone[];
    programme: Programme;
  })[];

  const actions = (actionsRes.data ?? []) as Action[];
  const risks = (risksRes.data ?? []) as Risk[];
  const programmes = (programmesRes.data ?? []) as Programme[];
  const sitesForDropdown = sites.map((s) => ({
    id: s.id,
    identifier: s.identifier,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Admin
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage sites, milestones, actions, and risks
          </p>
        </div>
        <span className="text-xs bg-gray-900 text-white px-2.5 py-1 rounded-md font-medium">
          Admin Mode
        </span>
      </div>

      <div>
        <h1>Debug</h1>
        <p>Programmes: {programmes.length}</p>
        <p>Sites: {sites.length}</p>
        <p>Actions: {actions.length}</p>
        <p>Risks: {risks.length}</p>
      </div>
    </div>
  );
}
