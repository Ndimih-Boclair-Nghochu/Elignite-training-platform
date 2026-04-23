export type AppRole = "ceo" | "teacher" | "student";

export function normalizeRole(role?: string | null): AppRole {
  const value = (role || "").toLowerCase().trim();

  if (value === "ceo" || value === "admin") return "ceo";
  if (value === "teacher") return "teacher";
  return "student";
}

export function isCeoRole(role?: string | null): boolean {
  return normalizeRole(role) === "ceo";
}
