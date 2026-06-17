import { supabase } from "@/lib/supabase";
import type { Site, Milestone, Action } from "@/lib/types";
import { formatDate, isOverdue, isDueSoon } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

async function getDashboardData() {
  const [sitesRes, actionsRes, programmesRes] = await Promise.all([
    supabase.from("sites").select("*, milestones(*), programme:programmes(*)"),
    supabase.from("actions").select("*, programme:programmes(*), site:sites(identifier)").eq("status", "open"),
    supabase.from("programmes").select("*"),
  ]);

  return {
    sites: (sitesRes.data ?? []) as (Site & { milestones: Milestone[] })[],
    openActions: (actionsRes.data ?? []) as Action[],
    programmes: programmesRes.data ?? [],
  };
}

export const revalidate = 0;

export default async function DashboardPage() {
  const { sites, openActions, programmes } = await getDashboardData();

  // KPI calculations
  const totalSites = sites.length;
  const liveSites = sites.filter((s) => s.status === "live").length;
  const pendingSites = sites.filter((s) => s.status === "pending").length;
  const blockedSites = sites.filter((s) => s.status === "blocked").length;
  const highPriority = openActions.filter((a) => a.priority === "high").length;

  // Attention items
  const overdueActions = openActions.filter((a) => isOverdue(a.due_date, a.status));
  const dueSoonActions = openActions.filter((a) => isDueSoon(a.due_date, a.status));
  const blockedMilestones = sites.flatMap((s) =>
    (s.milestones ?? [])
      .filter((m) => m.status === "blocked")
      .map((m) => ({ ...m, site: s }))
  );

  // Programme summaries
  const programmeSummaries = programmes.map((prog) => {
    const progSites = sites.filter((s) => s.programme_id === prog.id);
    const allMilestones = progSites.flatMap((s) => s.milestones ?? []);
    const completedMilestones = allMilestones.filter((m) => m.status === "complete").length;
    const totalMilestones = allMilestones.length;
    const pct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    return {
      ...prog,
      totalSites: progSites.length,
      liveSites: progSites.filter((s) => s.status === "live").length,
      pendingSites: progSites.filter((s) => s.status === "pending").length,
      pct,
    };
  });

  const now = format(new Date(), "d MMM yyyy, HH:mm");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Qure–Merck Partnership
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Programme Tracking Dashboard</p>
        </div>
        <p className="text-xs text-gray-400">Last updated: {now}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Sites", value: totalSites, color: "text-gray-900" },
          { label: "Live", value: liveSites, color: "text-green-700" },
          { label: "Pending", value: pendingSites, color: "text-amber-700" },
          { label: "Blocked", value: blockedSites, color: "text-red-700" },
          { label: "Open Actions", value: openActions.length, color: "text-blue-700" },
          { label: "High Priority", value: highPriority, color: "text-red-700" },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
            <p className={`text-3xl font-semibold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Attention Required */}
      {(overdueActions.length > 0 || dueSoonActions.length > 0 || blockedMilestones.length > 0) && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Attention Required</h2>
          <div className="space-y-2">
            {overdueActions.map((a) => (
              <AttentionItem
                key={`overdue-${a.id}`}
                type="overdue"
                label={`Overdue action: ${a.title}`}
                meta={`Due ${formatDate(a.due_date)} · ${a.priority} priority`}
                href="/actions"
              />
            ))}
            {dueSoonActions.map((a) => (
              <AttentionItem
                key={`soon-${a.id}`}
                type="soon"
                label={`Due soon: ${a.title}`}
                meta={`Due ${formatDate(a.due_date)}`}
                href="/actions"
              />
            ))}
            {blockedMilestones.map((m) => (
              <AttentionItem
                key={`blocked-${m.id}`}
                type="blocked"
                label={`Blocked milestone: ${m.name}`}
                meta={`Site ${(m.site as Site).identifier}`}
                href="/sites"
              />
            ))}
          </div>
        </div>
      )}

      {/* Programme Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Programmes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {programmeSummaries.map((prog) => (
            <Link key={prog.id} href="/sites" className="card p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{prog.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{prog.totalSites} sites</p>
                </div>
                <span className="text-2xl font-semibold text-gray-900">{prog.pct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                <div
                  className="bg-gray-900 h-1.5 rounded-full transition-all"
                  style={{ width: `${prog.pct}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="text-green-700 font-medium">{prog.liveSites} live</span>
                <span>{prog.pendingSites} pending</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function AttentionItem({
  type,
  label,
  meta,
  href,
}: {
  type: "overdue" | "soon" | "blocked";
  label: string;
  meta: string;
  href: string;
}) {
  const colors = {
    overdue: "bg-red-50 border-red-200 text-red-700",
    soon: "bg-amber-50 border-amber-200 text-amber-700",
    blocked: "bg-red-50 border-red-200 text-red-700",
  };
  const dots = {
    overdue: "bg-red-500",
    soon: "bg-amber-500",
    blocked: "bg-red-500",
  };

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm ${colors[type]} hover:opacity-80 transition-opacity`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[type]}`} />
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-xs opacity-70 whitespace-nowrap">{meta}</span>
    </Link>
  );
}
