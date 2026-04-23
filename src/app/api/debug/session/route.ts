export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  
  return NextResponse.json({
    sessionActive: !!session.userId,
    userId: session.userId,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    role: session.role,
    phone: session.phone,
    message: session.userId 
      ? `Logged in as ${session.firstName} ${session.lastName} (${session.role})`
      : "No active session - Please log in",
  });
}
