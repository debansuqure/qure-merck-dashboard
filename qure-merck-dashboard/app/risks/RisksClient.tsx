"use client";

import { useState } from "react";
import type { Risk, Programme } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function RisksClient({
  risks,
  programmes,
  isAdmin,
  onUpdate,
  onDelete,
  onAdd,
}: {
  risks: Risk[];
  programmes: Programme[];
  isAdmin: boolean;
  onUpdate?: (id: string, updates: Partial<Risk>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onAdd?: (risk: Partial<Risk>) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");

  const filtered = risks.filter((r) => filterStatus === "all" || r.status === filterStatus);

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <select
          className="select sm:w-40"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
        >
          <option value="all">All risks</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <span className="text-xs text-gray-400 flex-1">{filtered.length} risk{filtered.length !== 1 ? "s" : ""}</span>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Risk</button>
        )}
      </div>

      {isAdmin && showAdd && (
        <RiskForm
          programmes={programmes}
          onSave={async (d) => { await onAdd?.(d); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-sm text-gray-400">No risks logged.</div>
        )}
        {filtered.map((risk) =>
          editingId === risk.id && isAdmin ? (
            <RiskForm
              key={risk.id}
              initial={risk}
              programmes={programmes}
              onSave={async (d) => { await onUpdate?.(risk.id, d); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <RiskRow
              key={risk.id}
              risk={risk}
              isAdmin={isAdmin}
              onEdit={() => setEditingId(risk.id)}
              onClose={() => onUpdate?.(risk.id, { status: "closed" })}
              onDelete={() => onDelete?.(risk.id)}
            />
          )
        )}
      </div>
    </div>
  );
}

function RiskRow({
  risk, isAdmin, onEdit, onClose, onDelete,
}: {
  risk: Risk;
  isAdmin: boolean;
  onEdit: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={cn("card px-4 py-3", risk.status === "closed" && "opacity-60")}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-sm text-gray-900">{risk.title}</span>
            <span className={cn("chip", risk.status === "open" ? "badge-open" : "chip-complete")}>
              {risk.status.charAt(0).toUpperCase() + risk.status.slice(1)}
            </span>
            {(risk.programme as Programme | undefined)?.name && (
              <span className="chip chip-pending">{(risk.programme as Programme).name}</span>
            )}
          </div>
          {risk.impact && (
            <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Impact: </span>{risk.impact}</p>
          )}
          {risk.mitigation && (
            <p className="text-xs text-gray-500"><span className="font-medium text-gray-700">Mitigation: </span>{risk.mitigation}</p>
          )}
          {risk.owner && (
            <p className="text-xs text-gray-400">Owner: {risk.owner}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {risk.status === "open" && (
              <button onClick={onClose} className="btn-secondary text-xs py-1">Close</button>
            )}
            <button onClick={onEdit} className="btn-secondary text-xs py-1">Edit</button>
            <button onClick={onDelete} className="btn-danger text-xs py-1">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

function RiskForm({
  initial,
  programmes,
  onSave,
  onCancel,
}: {
  initial?: Partial<Risk>;
  programmes: Programme[];
  onSave: (data: Partial<Risk>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    programme_id: initial?.programme_id ?? "",
    impact: initial?.impact ?? "",
    mitigation: initial?.mitigation ?? "",
    owner: initial?.owner ?? "",
    status: initial?.status ?? "open",
  });
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave({
      ...form,
      programme_id: form.programme_id || null,
      impact: form.impact || null,
      mitigation: form.mitigation || null,
      owner: form.owner || null,
    } as Partial<Risk>);
    setSaving(false);
  }

  return (
    <div className="card p-4 border-gray-300">
      <p className="text-sm font-semibold text-gray-900 mb-3">{initial ? "Edit Risk" : "New Risk"}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div className="sm:col-span-2">
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Risk title" />
        </div>
        <div>
          <label className="label">Programme</label>
          <select className="select" value={form.programme_id} onChange={(e) => set("programme_id", e.target.value)}>
            <option value="">— None —</option>
            {programmes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Owner</label>
          <input className="input" value={form.owner} onChange={(e) => set("owner", e.target.value)} placeholder="Name" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Impact</label>
          <textarea className="input" rows={2} value={form.impact} onChange={(e) => set("impact", e.target.value)} placeholder="Describe the potential impact" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Mitigation</label>
          <textarea className="input" rows={2} value={form.mitigation} onChange={(e) => set("mitigation", e.target.value)} placeholder="Describe the mitigation plan" />
        </div>
        {initial && (
          <div>
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={handleSave} disabled={saving || !form.title.trim()}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
