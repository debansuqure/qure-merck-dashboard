"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Site, Milestone, Action, Risk, Programme } from "@/lib/types";
import { cn, milestoneStatusLabel } from "@/lib/utils";
import ActionsClient from "@/app/actions/ActionsClient";
import RisksClient from "@/app/risks/RisksClient";

type SiteWithDetails = Site & { milestones: Milestone[]; programme: Programme };

const MILESTONE_STATUS_CYCLE: Array<Milestone["status"]> = ["pending", "in_progress", "complete", "blocked"];
const MILESTONE_COLORS: Record<string, string> = {
  pending: "chip chip-pending",
  in_progress: "chip chip-in_progress",
  complete: "chip chip-complete",
  blocked: "chip chip-blocked",
};

export default function AdminClient({
  sites: initialSites,
  actions: initialActions,
  risks: initialRisks,
  programmes,
  sitesForDropdown,
}: {
  sites: SiteWithDetails[];
  actions: Action[];
  risks: Risk[];
  programmes: Programme[];
  sitesForDropdown: Pick<Site, "id" | "identifier">[];
}) {
  const router = useRouter();
  const [sites, setSites] = useState(initialSites);
  const [actions, setActions] = useState(initialActions);
  const [risks, setRisks] = useState(initialRisks);
  const [activeTab, setActiveTab] = useState<"sites" | "actions" | "risks">("sites");
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());
  const [expandedProgrammes, setExpandedProgrammes] = useState<Set<string>>(
    new Set(programmes.map((p) => p.id))
  );
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }

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

  // ── Milestones ──────────────────────────────────────────────────────────────
  async function cycleMilestoneStatus(milestone: Milestone) {
    const idx = MILESTONE_STATUS_CYCLE.indexOf(milestone.status);
    const next = MILESTONE_STATUS_CYCLE[(idx + 1) % MILESTONE_STATUS_CYCLE.length];

    const res = await fetch("/api/admin/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: milestone.id, status: next }),
    });
    if (!res.ok) { showToast("Failed to update milestone"); return; }

    setSites((prev) =>
      prev.map((site) => ({
        ...site,
        milestones: site.milestones.map((m) =>
          m.id === milestone.id ? { ...m, status: next } : m
        ),
      }))
    );
    showToast(`Milestone "${milestone.name}" → ${milestoneStatusLabel(next)}`);
  }

  // ── Site notes ──────────────────────────────────────────────────────────────
  function startEditingNotes(site: SiteWithDetails) {
    setEditingNotes((prev) => ({ ...prev, [site.id]: site.notes ?? "" }));
  }

  async function saveNotes(siteId: string) {
    setSavingNotes((prev) => new Set(prev).add(siteId));
    const notes = editingNotes[siteId];
    const res = await fetch("/api/admin/sites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: siteId, notes }),
    });
    setSavingNotes((prev) => { const s = new Set(prev); s.delete(siteId); return s; });
    if (!res.ok) { showToast("Failed to save notes"); return; }
    setSites((prev) => prev.map((s) => s.id === siteId ? { ...s, notes } : s));
    setEditingNotes((prev) => { const n = { ...prev }; delete n[siteId]; return n; });
    showToast("Notes saved");
  }

  // ── Site status ─────────────────────────────────────────────────────────────
  async function updateSiteStatus(siteId: string, status: Site["status"]) {
    const res = await fetch("/api/admin/sites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: siteId, status }),
    });
    if (!res.ok) { showToast("Failed to update status"); return; }
    setSites((prev) => prev.map((s) => s.id === siteId ? { ...s, status } : s));
    showToast("Status updated");
  }

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleAddAction = useCallback(async (data: Partial<Action>) => {
    const res = await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) { showToast("Failed to add action"); return; }
    const created = await res.json();
    setActions((prev) => [created, ...prev]);
    showToast("Action added");
  }, []);

  const handleUpdateAction = useCallback(async (id: string, updates: Partial<Action>) => {
    const res = await fetch("/api/admin/actions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) { showToast("Failed to update action"); return; }
    const updated = await res.json();
    setActions((prev) => prev.map((a) => a.id === id ? { ...a, ...updated } : a));
    showToast("Action updated");
  }, []);

  const handleDeleteAction = useCallback(async (id: string) => {
    if (!confirm("Delete this action?")) return;
    const res = await fetch(`/api/admin/actions?id=${id}`, { method: "DELETE" });
    if (!res.ok) { showToast("Failed to delete action"); return; }
    setActions((prev) => prev.filter((a) => a.id !== id));
    showToast("Action deleted");
  }, []);

  // ── Risks ────────────────────────────────────────────────────────────────────
  const handleAddRisk = useCallback(async (data: Partial<Risk>) => {
    const res = await fetch("/api/admin/risks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) { showToast("Failed to add risk"); return; }
    const created = await res.json();
    setRisks((prev) => [created, ...prev]);
    showToast("Risk added");
  }, []);

  const handleUpdateRisk = useCallback(async (id: string, updates: Partial<Risk>) => {
    const res = await fetch("/api/admin/risks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) { showToast("Failed to update risk"); return; }
    const updated = await res.json();
    setRisks((prev) => prev.map((r) => r.id === id ? { ...r, ...updated } : r));
    showToast("Risk updated");
  }, []);

  const handleDeleteRisk = useCallback(async (id: string) => {
    if (!confirm("Delete this risk?")) return;
    const res = await fetch(`/api/admin/risks?id=${id}`, { method: "DELETE" });
    if (!res.ok) { showToast("Failed to delete risk"); return; }
    setRisks((prev) => prev.filter((r) => r.id !== id));
    showToast("Risk deleted");
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  const grouped = programmes.map((prog) => ({
    programme: prog,
    sites: sites.filter((s) => s.programme_id === prog.id),
  }));

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["sites", "actions", "risks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2",
              activeTab === tab
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Sites tab */}
      {activeTab === "sites" && (
        <div className="space-y-4">
          {grouped.map(({ programme, sites: progSites }) => {
            const open = expandedProgrammes.has(programme.id);
            return (
              <div key={programme.id} className="card overflow-hidden">
                <button
                  onClick={() => toggleProgramme(programme.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <ChevronIcon open={open} />
                  <span className="font-semibold text-gray-900">{programme.name}</span>
                  <span className="text-sm text-gray-400">{progSites.length} sites</span>
                </button>

                {open && (
                  <div className="border-t border-gray-100">
                    {progSites.map((site) => {
                      const siteOpen = expandedSites.has(site.id);
                      const sortedMilestones = [...(site.milestones ?? [])].sort(
                        (a, b) => a.sort_order - b.sort_order
                      );
                      const isEditingNotes = site.id in editingNotes;

                      return (
                        <div key={site.id} className="border-b border-gray-100 last:border-0">
                          <button
                            onClick={() => toggleSite(site.id)}
                            className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <ChevronIcon open={siteOpen} size="sm" />
                              <span className="text-sm font-medium text-gray-900">{site.identifier}</span>
                              <span className="text-xs text-gray-400">{site.country}</span>
                            </div>
                            <StatusSelect
                              value={site.status}
                              onChange={(v) => updateSiteStatus(site.id, v as Site["status"])}
                            />
                          </button>

                          {siteOpen && (
                            <div className="px-5 pb-5 space-y-4 bg-gray-50/50">
                              {/* Notes */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-xs font-medium text-gray-500">Notes</p>
                                  {!isEditingNotes && (
                                    <button
                                      onClick={() => startEditingNotes(site)}
                                      className="text-xs text-gray-400 hover:text-gray-700"
                                    >
                                      Edit
                                    </button>
                                  )}
                                </div>
                                {isEditingNotes ? (
                                  <div className="space-y-2">
                                    <textarea
                                      className="input text-sm"
                                      rows={3}
                                      value={editingNotes[site.id]}
                                      onChange={(e) =>
                                        setEditingNotes((prev) => ({ ...prev, [site.id]: e.target.value }))
                                      }
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        className="btn-primary text-xs py-1"
                                        disabled={savingNotes.has(site.id)}
                                        onClick={() => saveNotes(site.id)}
                                      >
                                        {savingNotes.has(site.id) ? "Saving…" : "Save"}
                                      </button>
                                      <button
                                        className="btn-secondary text-xs py-1"
                                        onClick={() =>
                                          setEditingNotes((prev) => {
                                            const n = { ...prev };
                                            delete n[site.id];
                                            return n;
                                          })
                                        }
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600">
                                    {site.notes || <span className="text-gray-400 italic">No notes — click Edit to add</span>}
                                  </p>
                                )}
                              </div>

                              {/* Milestones */}
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-2">
                                  Milestones{" "}
                                  <span className="text-gray-400 font-normal">(click to cycle status)</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {sortedMilestones.map((m) => (
                                    <button
                                      key={m.id}
                                      onClick={() => cycleMilestoneStatus(m)}
                                      className={cn(
                                        MILESTONE_COLORS[m.status],
                                        "cursor-pointer hover:opacity-80 transition-opacity"
                                      )}
                                      title={`Click to change: currently ${milestoneStatusLabel(m.status)}`}
                                    >
                                      {m.name}
                                    </button>
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
      )}

      {/* Actions tab */}
      {activeTab === "actions" && (
        <ActionsClient
          actions={actions}
          programmes={programmes}
          sites={sitesForDropdown}
          isAdmin
          onAdd={handleAddAction}
          onUpdate={handleUpdateAction}
          onDelete={handleDeleteAction}
        />
      )}

      {/* Risks tab */}
      {activeTab === "risks" && (
        <RisksClient
          risks={risks}
          programmes={programmes}
          isAdmin
          onAdd={handleAddRisk}
          onUpdate={handleUpdateRisk}
          onDelete={handleDeleteRisk}
        />
      )}
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const colors: Record<string, string> = {
    live: "text-green-700 bg-green-50 border-green-200",
    pending: "text-gray-600 bg-gray-100 border-gray-200",
    blocked: "text-red-700 bg-red-50 border-red-200",
  };
  return (
    <select
      value={value}
      onChange={(e) => { e.stopPropagation(); onChange(e.target.value); }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "text-xs font-medium px-2 py-1 rounded-md border focus:outline-none cursor-pointer",
        colors[value] ?? "bg-gray-100 text-gray-600"
      )}
    >
      <option value="pending">Pending</option>
      <option value="live">Live</option>
      <option value="blocked">Blocked</option>
    </select>
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
