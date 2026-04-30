import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { isCeoRole, isPartnerRole } from "@/lib/roles";
import { getSessionSecret } from "@/lib/env";

/* -------------------- TYPES -------------------- */

export interface SessionData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "ceo" | "teacher" | "student" | "partner";
  teacherId?: number;
  studentId?: number;
  partnerProfileId?: number;
  phone?: string;
  photoUrl?: string;
}

/* -------------------- CONFIG -------------------- */

const sessionSecret = getSessionSecret();

const sessionOptions = {
  password: sessionSecret,
  cookieName: "school-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

/* -------------------- GET SESSION -------------------- */

export async function getSession(): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(
    cookies(),
    sessionOptions
  );

  return session;
}

/* -------------------- REQUIRE AUTH -------------------- */

export async function requireAuth(): Promise<IronSession<SessionData>> {
  const session = await getSession();

  if (!session.userId) {
    throw new Error("Unauthorized - Not logged in");
  }

  return session;
}

/* -------------------- REQUIRE CEO -------------------- */

export async function requireCEO(): Promise<IronSession<SessionData>> {
  const session = await requireAuth();

  if (!isCeoRole(session.role)) {
    throw new Error("Unauthorized - CEO only");
  }

  return session;
}

export async function requirePartner(): Promise<IronSession<SessionData>> {
  const session = await requireAuth();

  if (!isPartnerRole(session.role)) {
    throw new Error("Unauthorized - Partner only");
  }

  return session;
}

export async function requireRole(...roles: SessionData["role"][]) {
  const session = await requireAuth();

  if (!roles.includes(session.role)) {
    throw new Error("Unauthorized - Forbidden");
  }

  return session;
}
