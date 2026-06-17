import { supabase } from "@/lib/supabase";
import type { Risk, Programme } from "@/lib/types";
import RisksClient from "./RisksClient";

export const revalidate = 0;

export default async function RisksPage() {
  const [risksRes, programmesRes] = await Promise.all([
    supabase.from("risks").select("*, programme:programmes(*)").order("created_at", { ascending: false }),
    supabase.from("programmes").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Risk Register</h1>
        <p className="text-sm text-gray-500 mt-0.5">Programme risks and mitigations</p>
      </div>
      <RisksClient
        risks={(risksRes.data ?? []) as Risk[]}
        programmes={(programmesRes.data ?? []) as Programme[]}
        isAdmin={false}
      />
    </div>
  );
}
