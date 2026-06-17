import { clsx, type ClassValue } from "clsx";
import { format, isPast, isWithinInterval, addDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return format(new Date(date), "d MMM yyyy");
}

export function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "complete") return false;
  return isPast(new Date(dueDate));
}

export function isDueSoon(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "complete") return false;
  const date = new Date(dueDate);
  if (isPast(date)) return false;
  return isWithinInterval(date, { start: new Date(), end: addDays(new Date(), 7) });
}

export function milestoneStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    complete: "Complete",
    blocked: "Blocked",
  };
  return map[status] ?? status;
}

export function priorityLabel(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
