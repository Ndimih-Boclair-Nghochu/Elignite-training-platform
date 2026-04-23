import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gradeFromScore(total: number): string {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B+";
  if (total >= 65) return "B";
  if (total >= 60) return "C+";
  if (total >= 55) return "C";
  if (total >= 50) return "D";
  return "F";
}

export function formatCurrency(amount: number): string {
  return `₣${amount.toLocaleString()}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function generateId(prefix: string): string {
  return `${prefix}${Date.now().toString().slice(-6)}`;
}
