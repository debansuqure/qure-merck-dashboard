"use client";

import { useState } from "react";
import type { Site, Milestone, Programme } from "@/lib/types";
import { cn, milestoneStatusLabel } from "@/lib/utils";

type GroupedData = { programme: Programme; sites: (Site & { milestones: Milestone[] })[] };

const STATUS_COLORS: Record<string, string> = {
  live: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-gray-100 text-gray-600",
  blocked: "bg-red-50 text-red-700 border border-red-200",
};

const MILESTONE_COLORS: Record<string, string> = {
  pending: "chip chip-pending",
  in_progress: "chip chip-in_progress",
  complete: "chip chip-complete",
  blocked: "chip chip-blocked",
};

export default function SitesClient({ grouped }: { grouped: GroupedData[] }) {
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());
  const [expandedProgrammes, setExpandedProgrammes] = useState<Set<string>>(
    new Set(grouped.map((g) => g.programme.id))
  );

  function toggleSite(id: string) {
    setExpandedSites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleProgramme(id: string) {
    setExpandedProgrammes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {grouped.map(({ programme, sites }) => {
        const isOpen = expandedProgrammes.has(programme.id);
        const liveSites = sites.filter((s) => s.status === "live").length;
        return (
          <div key={programme.id} className="card overflow-hidden">
            <button
              onClick={() => toggleProgramme(programme.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ChevronIcon open={isOpen} />
                <span className="font-semibold text-gray-900">{programme.name}</span>
                <span className="text-sm text-gray-400">{sites.length} sites</span>
              </div>
              <span className="text-sm text-green-700 font-medium">{liveSites} live</span>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                {sites.length === 0 && (
                  <p className="px-5 py-4 text-sm text-gray-400">No sites configured.</p>
                )}
                {sites.map((site) => {
                  const siteOpen = expandedSites.has(site.id);
                  const sortedMilestones = [...(site.milestones ?? [])].sort(
                    (a, b) => a.sort_order - b.sort_order
                  );
                  return (
                    <div key={site.id} className="border-b border-gray-100 last:border-0">
                      <button
                        onClick={() => toggleSite(site.id)}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronIcon open={siteOpen} size="sm" />
                          <span className="text-sm font-medium text-gray-900">
                            {site.name || site.identifier}
                          </span>
                          <span className="text-xs text-gray-400">{site.country}</span>
                        </div>
                        <span
                          className={cn(
                            "chip text-xs",
                            STATUS_COLORS[site.status] ?? "bg-gray-100 text-gray-600"
                          )}
                        >
                          {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                        </span>
                      </button>

                      {siteOpen && (
                        <div className="px-5 pb-4 space-y-3 bg-gray-50/50">
                          {site.notes && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                              <p className="text-sm text-gray-700">{site.notes}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Milestones</p>
                            <div className="flex flex-wrap gap-1.5">
                              {sortedMilestones.length === 0 && (
                                <span className="text-xs text-gray-400">No milestones</span>
                              )}
                              {sortedMilestones.map((m) => (
                                <span
                                  key={m.id}
                                  title={milestoneStatusLabel(m.status)}
                                  className={cn(MILESTONE_COLORS[m.status] ?? "chip chip-pending")}
                                >
                                  {m.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChevronIcon({ open, size = "md" }: { open: boolean; size?: "sm" | "md" }) {
  return (
    <svg
      className={cn(
        "transition-transform text-gray-400 flex-shrink-0",
        open ? "rotate-90" : "",
        size === "sm" ? "w-3 h-3" : "w-4 h-4"
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
