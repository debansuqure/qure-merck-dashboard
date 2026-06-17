"use client";

import { useState, useMemo } from "react";
import type { Action, Programme, Site } from "@/lib/types";
import { cn, formatDate, isOverdue, isDueSoon } from "@/lib/utils";

type SortField = "due_date" | "priority" | "created_at" | "title";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function ActionsClient({
  actions,
  programmes,
  sites,
  isAdmin,
  onUpdate,
  onDelete,
  onAdd,
}: {
  actions: Action[];
  programmes: Programme[];
  sites: Site[];
  isAdmin: boolean;
  onUpdate?: (id: string, updates: Partial<Action>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onAdd?: (action: Partial<Action>) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "complete">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [filterProgramme, setFilterProgramme] = useState("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const filtered = useMemo(() => {
    let result = [...actions];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description ?? "").toLowerCase().includes(q) ||
          (a.owner ?? "").toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") result = result.filter((a) => a.status === filterStatus);
    if (filterPriority !== "all") result = result.filter((a) => a.priority === filterPriority);
    if (filterProgramme !== "all") result = result.filter((a) => a.programme_id === filterProgramme);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "priority") {
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      } else if (sortField === "due_date") {
        const da = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const db2 = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        cmp = da - db2;
      } else if (sortField === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        cmp = a.title.localeCompare(b.title);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [actions, search, filterStatus, filterPriority, filterProgramme, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)} className="select sm:w-36">
            <option value="all">All status</option>
            <option value="open">Open</option>
            <option value="complete">Complete</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as typeof filterPriority)} className="select sm:w-36">
            <option value="all">All priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={filterProgramme} onChange={(e) => setFilterProgramme(e.target.value)} className="select sm:w-40">
            <option value="all">All programmes</option>
            {programmes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {isAdmin && (
            <button onClick={() => setShowAddForm(true)} className="btn-primary whitespace-nowrap">
              + Add Action
            </button>
          )}
        </div>
      </div>

      {/* Add form */}
      {isAdmin && showAddForm && (
        <ActionForm
          programmes={programmes}
          sites={sites}
          onSave={async (data) => { await onAdd?.(data); setShowAddForm(false); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Sort bar */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 px-1">
        <span className="flex-1">
          {filtered.length} action{filtered.length !== 1 ? "s" : ""}
        </span>
        <SortButton label="Title" field="title" current={sortField} dir={sortDir} onToggle={toggleSort} />
        <SortButton label="Priority" field="priority" current={sortField} dir={sortDir} onToggle={toggleSort} />
        <SortButton label="Due Date" field="due_date" current={sortField} dir={sortDir} onToggle={toggleSort} />
        <SortButton label="Created" field="created_at" current={sortField} dir={sortDir} onToggle={toggleSort} />
      </div>

      {/* Action list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-sm text-gray-400">No actions found.</div>
        )}
        {filtered.map((action) => (
          editingId === action.id && isAdmin ? (
            <ActionForm
              key={action.id}
              initial={action}
              programmes={programmes}
              sites={sites}
              onSave={async (data) => { await onUpdate?.(action.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ActionRow
              key={action.id}
              action={action}
              isAdmin={isAdmin}
              onEdit={() => setEditingId(action.id)}
              onComplete={async () => onUpdate?.(action.id, { status: "complete" })}
              onDelete={async () => onDelete?.(action.id)}
            />
          )
        ))}
      </div>
    </div>
  );
}

function ActionRow({
  action,
  isAdmin,
  onEdit,
  onComplete,
  onDelete,
}: {
  action: Action;
  isAdmin: boolean;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const overdue = isOverdue(action.due_date, action.status);
  const soon = isDueSoon(action.due_date, action.status);

  return (
    <div
      className={cn(
        "card px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3",
        overdue && "border-red-200 bg-red-50/30",
        soon && !overdue && "border-amber-200 bg-amber-50/20",
        action.status === "complete" && "opacity-60"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={cn("font-medium text-sm text-gray-900", action.status === "complete" && "line-through")}>
            {action.title}
          </span>
          <PriorityBadge priority={action.priority} />
          <StatusBadge status={action.status} />
        </div>
        {action.description && (
          <p className="text-xs text-gray-500 mb-1 line-clamp-2">{action.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {(action.programme as Programme | undefined)?.name && (
            <span>{(action.programme as Programme).name}</span>
          )}
          {(action.site as Site | undefined)?.identifier && (
            <span>{(action.site as Site).identifier}</span>
          )}
          {action.owner && <span>Owner: {action.owner}</span>}
          {action.due_date && (
            <span className={cn(overdue && "text-red-600 font-medium", soon && "text-amber-600 font-medium")}>
              Due: {formatDate(action.due_date)}{overdue ? " · Overdue" : soon ? " · Due soon" : ""}
            </span>
          )}
        </div>
      </div>
      {isAdmin && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {action.status === "open" && (
            <button onClick={onComplete} className="btn-secondary text-xs py-1">
              Complete
            </button>
          )}
          <button onClick={onEdit} className="btn-secondary text-xs py-1">Edit</button>
          <button onClick={onDelete} className="btn-danger text-xs py-1">Delete</button>
        </div>
      )}
    </div>
  );
}

function ActionForm({
initial,
programmes,
sites,
onSave,
onCancel,
}: {
initial?: Partial<Action>;
programmes: Programme[];
sites: Site[];
onSave: (data: Partial<Action>) => Promise<void>;
onCancel: () => void;
}) {
const [form, setForm] = useState({
title: initial?.title ?? "",
description: initial?.description ?? "",
programme_id: initial?.programme_id ?? "",
site_id: initial?.site_id ?? "",
milestone_id: (initial as any)?.milestone_id ?? "",
owner: initial?.owner ?? "",
priority: initial?.priority ?? "medium",
due_date: initial?.due_date ?? "",
status: initial?.status ?? "open",
});

const [saving, setSaving] = useState(false);

const selectedSite = sites.find(
(s) => s.id === form.site_id
);

const availableMilestones =
selectedSite?.milestones ?? [];

function set(field: string, value: string) {
setForm((prev) => ({ ...prev, [field]: value }));
}

async function handleSave() {
if (!form.title.trim()) return;

```
setSaving(true);

await onSave({
  ...form,
  milestone_id: form.milestone_id || null,
  programme_id: form.programme_id || null,
  site_id: form.site_id || null,
  owner: form.owner || null,
  description: form.description || null,
  due_date: form.due_date || null,
} as Partial<Action>);

setSaving(false);
```

}

return ( <div className="card p-4 border-gray-300"> <p className="text-sm font-semibold text-gray-900 mb-3">
{initial ? "Edit Action" : "New Action"} </p>

```
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
    <div className="sm:col-span-2">
      <label className="label">Title *</label>
      <input
        className="input"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="Action title"
      />
    </div>

    <div className="sm:col-span-2">
      <label className="label">Description</label>
      <textarea
        className="input"
        rows={2}
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Optional description"
      />
    </div>

    <div>
      <label className="label">Programme</label>
      <select
        className="select"
        value={form.programme_id}
        onChange={(e) => set("programme_id", e.target.value)}
      >
        <option value="">— None —</option>
        {programmes.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="label">Site</label>
      <select
        className="select"
        value={form.site_id}
        onChange={(e) => {
          set("site_id", e.target.value);
          set("milestone_id", "");
        }}
      >
        <option value="">— None —</option>
        {sites.map((s) => (
          <option key={s.id} value={s.id}>
            {s.identifier}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="label">Milestone</label>
      <select
        className="select"
        value={(form as any).milestone_id}
        onChange={(e) => set("milestone_id", e.target.value)}
      >
        <option value="">— None —</option>

        {availableMilestones.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="label">Owner</label>
      <input
        className="input"
        value={form.owner}
        onChange={(e) => set("owner", e.target.value)}
        placeholder="Name"
      />
    </div>

    <div>
      <label className="label">Priority</label>
      <select
        className="select"
        value={form.priority}
        onChange={(e) => set("priority", e.target.value)}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>

    <div>
      <label className="label">Due Date</label>
      <input
        type="date"
        className="input"
        value={form.due_date}
        onChange={(e) => set("due_date", e.target.value)}
      />
    </div>

    {initial && (
      <div>
        <label className="label">Status</label>
        <select
          className="select"
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="open">Open</option>
          <option value="complete">Complete</option>
        </select>
      </div>
    )}
  </div>

  <div className="flex gap-2">
    <button
      className="btn-primary"
      onClick={handleSave}
      disabled={saving || !form.title.trim()}
    >
      {saving ? "Saving…" : "Save"}
    </button>

    <button
      className="btn-secondary"
      onClick={onCancel}
    >
      Cancel
    </button>
  </div>
</div>
```

);
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={cn("chip", `badge-${priority}`)}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("chip", `badge-${status}`)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SortButton({
  label, field, current, dir, onToggle,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onToggle: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <button
      onClick={() => onToggle(field)}
      className={cn("px-2 py-1 rounded hover:bg-gray-100 transition-colors", active && "text-gray-700 font-medium")}
    >
      {label} {active ? (dir === "asc" ? "↑" : "↓") : ""}
    </button>
  );
}
