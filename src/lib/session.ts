import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { isCeoRole } from "@/lib/roles";

/* -------------------- TYPES -------------------- */

export interface SessionData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "ceo" | "teacher" | "student";
  teacherId?: number;
  studentId?: number;
  phone?: string;
  photoUrl?: string;
}

/* -------------------- CONFIG -------------------- */

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "very-secure-secret-key-with-at-least-32-characters",
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
