import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

function authGuard() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const guard = authGuard();
  if (guard) return guard;

  const body = await req.json();
  const db = createAdminClient();
  const { data, error } = await db
    .from("actions")
    .insert({
      title: body.title,
      description: body.description || null,
      programme_id: body.programme_id || null,
      site_id: body.site_id || null,
      owner: body.owner || null,
      priority: body.priority || "medium",
      due_date: body.due_date || null,
      status: "open",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = authGuard();
  if (guard) return guard;

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const allowed = ["title", "description", "programme_id", "site_id", "owner", "priority", "due_date", "status"];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );
  filtered.updated_at = new Date().toISOString();

  const db = createAdminClient();
  const { data, error } = await db
    .from("actions")
    .update(filtered)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const guard = authGuard();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from("actions").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
