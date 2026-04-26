export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { concept, subject, level } = await req.json();
  return NextResponse.json({
    explanation: `${concept} is a fundamental concept in ${subject}. At the ${level} level, it refers to the core principle that underpins how ${concept.toLowerCase()} operates within the broader context of ${subject}. Understanding this concept requires grasping both its theoretical foundations and practical applications.`,
    examples: [`Example 1: In a real-world scenario, ${concept} is used when processing sequential data structures.`, `Example 2: Consider how ${concept} applies when solving recursive problems in ${subject}.`, `Example 3: Practical application of ${concept} can be seen in industry-standard frameworks.`],
    keyPoints: [`${concept} is foundational to advanced topics in ${subject}.`, "Always consider edge cases when applying this concept.", "Practice with small examples before tackling complex problems.", "Connect this concept to related ideas you already know."],
    furtherReading: `Refer to your ${subject} textbook chapters covering ${concept}. Additionally, online resources like Khan Academy, Coursera, and your university library database have excellent materials on this topic.`,
  });
}
