export type AppRole = "ceo" | "teacher" | "student" | "partner";

export function normalizeRole(role?: string | null): AppRole {
  const value = (role || "").toLowerCase().trim();

  if (value === "ceo" || value === "admin") return "ceo";
  if (value === "teacher") return "teacher";
  if (value === "partner" || value === "school_partner" || value === "institution") return "partner";
  return "student";
}

export function isCeoRole(role?: string | null): boolean {
  return normalizeRole(role) === "ceo";
}

export function isPartnerRole(role?: string | null): boolean {
  return normalizeRole(role) === "partner";
}
