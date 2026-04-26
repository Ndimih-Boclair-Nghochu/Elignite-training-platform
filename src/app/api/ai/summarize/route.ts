export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { document: doc } = await req.json();
  const words = doc.split(/\s+/).length;
  const sentences = doc.split(/[.!?]+/).filter(Boolean);
  const firstSentence = sentences[0]?.trim() || "Document content";
  return NextResponse.json({
    summary: `This document (${words} words) covers: ${firstSentence}. The content provides detailed information on the subject matter with relevant explanations and supporting details.`,
    mainTopics: ["Key concept 1 from the document", "Supporting idea 2", "Related theme 3", "Conclusion topic"],
    importantDates: [],
    actionItems: ["Review and understand the main concepts presented.", "Take notes on key definitions and terminology.", "Practice applying the concepts with exercises.", "Seek clarification on unclear sections from your lecturer."],
  });
}
