export type MilestoneStatus = "pending" | "in_progress" | "complete" | "blocked";
export type ActionStatus = "open" | "complete";
export type ActionPriority = "low" | "medium" | "high";
export type RiskStatus = "open" | "closed";
export type SiteStatus = "live" | "pending" | "blocked";

export interface Programme {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Site {
  id: string;
  programme_id: string;
  identifier: string;
  name: string;
  country: string;
  status: SiteStatus;
  notes: string | null;
  created_at: string;
  programme?: Programme;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  site_id: string;
  name: string;
  status: MilestoneStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  title: string;
  description: string | null;
  programme_id: string | null;
  site_id: string | null;
  owner: string | null;
  priority: ActionPriority;
  due_date: string | null;
  status: ActionStatus;
  created_at: string;
  updated_at: string;
  programme?: Programme;
  site?: Site;
}

export interface Risk {
  id: string;
  title: string;
  programme_id: string | null;
  impact: string | null;
  mitigation: string | null;
  owner: string | null;
  status: RiskStatus;
  created_at: string;
  updated_at: string;
  programme?: Programme;
}

export interface DashboardStats {
  totalSites: number;
  liveSites: number;
  pendingSites: number;
  blockedSites: number;
  openActions: number;
  highPriorityActions: number;
}
