"use client";

import { useState } from "react";
import type { Site, Milestone, Programme } from "@/lib/types";
import { cn, milestoneStatusLabel } from "@/lib/utils";

type GroupedData = {
  programme: Programme;
  sites: (Site & { milestones: Milestone[] })[];
};

const STATUS_COLORS: Record<string, string> = {
  live: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-gray-100 text-gray-600",
  blocked: "bg-red-50 text-red-700 border border-red-200",
};

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  complete: "bg-green-100 border-green-300",
  in_progress: "bg-amber-100 border-amber-300",
  pending: "bg-gray-100 border-gray-300",
  blocked: "bg-red-100 border-red-300",
};

export default function SitesClient({
  grouped,
}: {
  grouped: GroupedData[];
}) {
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

        const uniqueMilestones = Array.from(
          new Map(
            sites
              .flatMap((s) => s.milestones ?? [])
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((m) => [m.name, m])
          ).values()
        );

        return (
          <div key={programme.id} className="card overflow-hidden">
            <button
              onClick={() => toggleProgramme(programme.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <ChevronIcon open={isOpen} />
                <span className="font-semibold text-gray-900">
                  {programme.name}
                </span>
                <span className="text-sm text-gray-400">
                  {sites.length} sites
                </span>
              </div>

              <span className="text-sm text-green-700 font-medium">
                {liveSites} live
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-max w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-5 py-4 text-left min-w-[260px]">
                          <span className="text-xs font-semibold uppercase text-gray-500">
                            Site
                          </span>
                        </th>

                        <th className="px-4 py-4 text-left min-w-[120px]">
                          <span className="text-xs font-semibold uppercase text-gray-500">
                            Status
                          </span>
                        </th>

                        {uniqueMilestones.map((milestone) => (
                          <th
                            key={milestone.name}
                            className="px-4 py-4 text-center min-w-[150px]"
                          >
                            <span className="text-xs font-semibold uppercase text-gray-500 whitespace-nowrap">
                              {milestone.name}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {sites.map((site) => {
                        const siteOpen = expandedSites.has(site.id);
                        const siteNameDisplay =
                          site.name || site.identifier;

                        return (
                          <>
                            <tr
                              key={site.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="px-5 py-4 min-w-[260px]">
                                <button
                                  onClick={() => toggleSite(site.id)}
                                  className="flex items-center gap-2"
                                >
                                  <ChevronIcon open={siteOpen} size="sm" />

                                  <span className="font-medium text-sm text-gray-900 whitespace-nowrap">
                                    {siteNameDisplay}
                                  </span>
                                </button>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={cn(
                                    "chip",
                                    STATUS_COLORS[site.status]
                                  )}
                                >
                                  {site.status}
                                </span>
                              </td>

                              {uniqueMilestones.map((milestone) => {
                                const siteMilestone =
                                  site.milestones?.find(
                                    (m) => m.name === milestone.name
                                  );

                                const status =
                                  siteMilestone?.status ?? "pending";

                                return (
                                  <td
                                    key={`${site.id}-${milestone.name}`}
                                    className="px-4 py-4 text-center"
                                  >
                                    <div className="flex justify-center">
                                      <div
                                        title={milestoneStatusLabel(status)}
                                        className={cn(
                                          "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                                          MILESTONE_STATUS_COLORS[status]
                                        )}
                                      />
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>

                            {siteOpen && (
                              <tr className="bg-gray-50">
                                <td
                                  colSpan={2 + uniqueMilestones.length}
                                  className="px-5 py-4"
                                >
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs font-medium text-gray-500">
                                        Country
                                      </p>
                                      <p className="text-sm text-gray-700">
                                        {site.country}
                                      </p>
                                    </div>

                                    {site.notes && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-500">
                                          Notes
                                        </p>
                                        <p className="text-sm text-gray-700">
                                          {site.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChevronIcon({
  open,
  size = "md",
}: {
  open: boolean;
  size?: "sm" | "md";
}) {
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
