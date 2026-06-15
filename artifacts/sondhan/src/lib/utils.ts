import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const CATEGORIES = [
  "ID Card",
  "Wallet",
  "Mobile Phone",
  "Laptop",
  "Headphones",
  "Keys",
  "Books",
  "Calculator",
  "USB Drive",
  "Lab Equipment",
  "Other",
];

export const STATUS_COLORS: Record<string, string> = {
  Lost: "bg-red-500/20 text-red-400 border border-red-500/30",
  Found: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Claimed: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  Returned: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  Pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Approved: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Rejected: "bg-red-500/20 text-red-400 border border-red-500/30",
};
