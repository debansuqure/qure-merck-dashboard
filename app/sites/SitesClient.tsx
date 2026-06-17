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

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  complete: "bg-green-500",
  in_progress: "bg-yellow-500",
  pending: "bg-gray-300",
  blocked: "bg-red-500",
};

export default function SitesClient({ grouped }: { grouped: GroupedData[] }) {
  const [expandedProgrammes, setExpandedProgrammes] = useState<Set<string>>(
    new Set(grouped.map((g) => g.programme.id))
  );
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());

  function toggleProgramme(id: string) {
    setExpandedProgrammes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSite(id: string) {
    setExpandedSites((prev) => {
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

        // Extract unique milestones per programme, sorted by sort_order
        const uniqueMilestones = Array.from(
          new Map(
            sites
              .flatMap((s) => s.milestones ?? [])
              .map((m) => [m.name, m])
          ).values()
        ).sort((a, b) => a.sort_order - b.sort_order);

        return (
          <div key={programme.id} className="card overflow-hidden">
            {/* Programme Header */}
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
                {sites.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-gray-400">No sites configured.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      {/* Table Header */}
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                          <th className="px-5 py-3 text-left">
                            <span className="text-xs font-semibold text-gray-600 uppercase">Site</span>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <span className="text-xs font-semibold text-gray-600 uppercase">Status</span>
                          </th>
                          {uniqueMilestones.map((milestone) => (
                            <th
                              key={milestone.id}
                              className="px-4 py-3 text-center whitespace-nowrap"
                            >
                              <span
                                className="text-xs font-semibold text-gray-600 uppercase"
                                title={milestoneStatusLabel(milestone.status)}
                              >
                                {milestone.name}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>

                      {/* Table Body */}
                      <tbody>
                        {sites.map((site) => {
                          const siteOpen = expandedSites.has(site.id);
                          const siteNameDisplay = site.name || site.identifier;

                          return (
                            <tbody key={site.id}>
                              {/* Site Row */}
                              <tr className="border-b border-gray-100 hover:bg-gray-50/30 transition-colors">
                                <td className="px-5 py-3">
                                  <button
                                    onClick={() => toggleSite(site.id)}
                                    className="flex items-center gap-2 text-left hover:text-gray-900 transition-colors"
                                  >
                                    <ChevronIcon open={siteOpen} size="sm" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {siteNameDisplay}
                                    </span>
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={cn(
                                      "chip text-xs",
                                      STATUS_COLORS[site.status] ?? "bg-gray-100 text-gray-600"
                                    )}
                                  >
                                    {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                                  </span>
                                </td>
                                {uniqueMilestones.map((milestone) => {
                                  const siteMilestone = site.milestones?.find(
                                    (m) => m.name === milestone.name
                                  );
                                  const status = siteMilestone?.status || "pending";
                                  const color = MILESTONE_STATUS_COLORS[status] || "bg-gray-300";

                                  return (
                                    <td key={milestone.id} className="px-4 py-3 text-center">
                                      {siteMilestone ? (
                                        <div className="flex justify-center">
                                          <div
                                            className={cn(
                                              "w-6 h-6 rounded-full transition-transform hover:scale-110",
                                              color
                                            )}
                                            title={milestoneStatusLabel(status)}
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex justify-center">
                                          <div
                                            className="w-6 h-6 rounded-full bg-gray-200 transition-transform hover:scale-110"
                                            title="Not applicable"
                                          />
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Expanded Details Row */}
                              {siteOpen && (
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                  <td colSpan={2 + uniqueMilestones.length} className="px-5 py-4">
                                    <div className="space-y-3">
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">
                                          Location
                                        </p>
                                        <p className="text-sm text-gray-700">{site.country}</p>
                                      </div>
                                      {site.notes && (
                                        <div>
                                          <p className="text-xs font-medium text-gray-500 mb-1">
                                            Notes
                                          </p>
                                          <p className="text-sm text-gray-700">{site.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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
